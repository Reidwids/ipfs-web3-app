import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/app/api/auth/[...nextauth]/options";
import { File } from "@prisma/client";

export type DownloadFileRequest = {
  cid: any;
};

export interface DownloadFileResponse extends File {}

export async function POST(request: Request) {
  // Get the file data for a specific CID

  const session = (await getServerSession(nextAuthConfig)) as any;
  if (!session) {
    return new NextResponse(null, { status: 401 });
  }

  // Get the CID from the request
  const { cid } = (await request.json()) as DownloadFileRequest;
  if (!cid) {
    return new NextResponse(JSON.stringify({ error: "Missing form data" }), {
      status: 400,
    });
  }

  // Find the file in the database
  const file = await prisma.file.findUnique({
    where: {
      cid,
      user: { id: session.user.id },
    },
  });
  if (!file) {
    return new NextResponse(
      JSON.stringify({ error: "Cannot find file for current user" }),
      { status: 404 }
    );
  }

  // Return file data
  return new NextResponse(JSON.stringify(file), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
