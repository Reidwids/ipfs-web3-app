import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/app/lib/prisma";
import { nextAuthConfig } from "../../auth/[...nextauth]/options";

export type UploadFileResponse = {
  cid: string;
  error?: string;
}

export async function POST(request: Request) {
  // Upload a file to IPFS
  const session = (await getServerSession(nextAuthConfig)) as any;
  if (!session) {
    return new NextResponse(null, { status: 401 });
  }

  // Get the file data from the request
  const formData = await request.formData();
  const fileData = formData.get("file") as Blob;
  const filename = formData.get("filename") as string;
  const privateKey = formData.get("privateKey") as string;
  if (!fileData || !filename) {
    return new NextResponse(JSON.stringify({ error: "Missing file data" }), {
      status: 400,
    });
  }

  // Use Pinata to upload the file to IPFS
  const pinataData = new FormData();
  pinataData.append("file", fileData);
  pinataData.append("pinataMetadata", JSON.stringify({ name: filename }));
  pinataData.append("pinataOptions", JSON.stringify({ cidVersion: 0 }));

  try {
    const pinataRes = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: pinataData,
      }
    );
    const pinataJson = await pinataRes.json();
    const cid = pinataJson.IpfsHash;
    // Create a new record to store the CID and the file data
    await prisma.file.create({
      data: {
        filename,
        cid: cid,
        fileSize: fileData.size,
        privateKey: privateKey ?? "",
        userId: session.user.id,
        uploadedAt: new Date(),
      },
    });
    return new NextResponse(JSON.stringify({ cid: cid }), { status: 200 });
  } catch (err: any) {
    if (err.code === "P2002" && err.meta.target.includes("cid")) {
      return new NextResponse(
        JSON.stringify({ error: "File cid already exists" }),
        { status: 409 }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: "Failed to upload file" }),
      { status: 500 }
    );
  }
}
