import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nextAuthConfig } from "@/app/api/auth/[...nextauth]/options";
import prisma from "@/app/lib/prisma";

export type CreateUserReq = {
  groups: { name: string; email: string }[][];
};

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const session = (await getServerSession(nextAuthConfig)) as any;
  if (!session) {
    return new NextResponse(null, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  if (!user) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(JSON.stringify(user), { status: 200 });
}

export async function PUT(request: Request) {
  const session = (await getServerSession(nextAuthConfig)) as any;
  if (!session) {
    return new NextResponse(null, { status: 401 });
  }

  const body = await request.json();

  if (!body) {
    return new NextResponse(null, { status: 400 });
  }
  if (!body.username && !body.email) {
    return new NextResponse(null, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: body,
  });

  return new NextResponse(JSON.stringify(user), { status: 200 });
}
