import crypto from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export type GenerateNonceRequest = {
  publicAddress: string;
};

export type GenerateNonceResponse = {
  nonce: string;
  nonceExpiry: Date;
};

export async function POST(request: Request) {
  const { publicAddress }: GenerateNonceRequest = await request.json();
  const nonce = crypto.randomBytes(32).toString("hex");

  const nonceExpiry = new Date(new Date().getTime() + 1000 * 60 * 60);

  let user = await prisma.user.findUnique({
    where: { publicAddress },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        publicAddress,
      },
    });
  }

  await prisma.user.update({
    where: { publicAddress },
    data: {
      nonce,
      nonceExpiry,
    },
  });

  const resBody: GenerateNonceResponse = {
    nonce,
    nonceExpiry,
  };

  return new NextResponse(JSON.stringify(resBody), { status: 200 });
}
