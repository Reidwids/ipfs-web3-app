import prisma from "@/app/lib/prisma";
import { RequestInternal } from "next-auth";
import { recoverMessageAddress } from "viem";

export async function authorizeCrypto(
  credentials: Record<"publicAddress" | "signedNonce", string> | undefined,
  req: Pick<RequestInternal, "body" | "headers" | "method" | "query">
) {
  if (!credentials) return null;

  const { publicAddress, signedNonce } = credentials as Record<
    "publicAddress" | "signedNonce",
    `0x${string}`
  >;

  const user = await prisma.user.findUnique({
    where: { publicAddress },
  });
  if (!user?.nonce) return null;

  const signerAddress = await recoverMessageAddress({
    message: user.nonce,
    signature: signedNonce,
  });

  if (signerAddress.toLocaleLowerCase() !== publicAddress.toLocaleLowerCase())
    return null;

  if (!user.nonceExpiry || user.nonceExpiry < new Date()) return null;

  await prisma.user.update({
    where: { publicAddress },
    data: { nonce: null, nonceExpiry: null },
  });
  return {
    id: user.id,
  };
}
