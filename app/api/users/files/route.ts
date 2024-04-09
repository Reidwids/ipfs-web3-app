import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/app/lib/prisma";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const session = (await getServerSession(nextAuthConfig)) as any;
  if (!session) {
    return new NextResponse(null, { status: 401 });
  }
  const prismaQuery: any = {
    where: {
      user: { id: session.user.id },
    },
  };

  const fromdate =
    request.url.includes("?") && request.url.split("?")[1].split("=")[1];
  if (fromdate) {
    prismaQuery.where.uploadedAt = {
      gte: new Date(parseInt(fromdate)),
    };
  }

  const files = await prisma.file.findMany(prismaQuery);
  return new NextResponse(JSON.stringify(files ?? []), { status: 200 });
}
