import prisma from "@/app/lib/prisma";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { bootstrap } from "@libp2p/bootstrap";
import { identify } from "@libp2p/identify";
import { tcp } from "@libp2p/tcp";
import { MemoryBlockstore } from "blockstore-core";
import { MemoryDatastore } from "datastore-core";
import { createHelia } from "helia";
import { createLibp2p } from "libp2p";
import { RequestInternal } from "next-auth";
import { recoverMessageAddress } from "viem";

export async function createNode() {
  const blockstore = new MemoryBlockstore();
  const datastore = new MemoryDatastore();

  const libp2p = await createLibp2p({
    datastore,
    addresses: {
      listen: ["/ip4/127.0.0.1/tcp/0"],
    },
    transports: [tcp()],
    connectionEncryption: [noise()],
    streamMuxers: [yamux()],
    peerDiscovery: [
      bootstrap({
        list: [
          "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
          "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
          "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
          "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
        ],
      }),
    ],
    services: {
      identify: identify(),
    },
  });

  return await createHelia({
    datastore,
    blockstore,
    libp2p,
  });
}

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
    publicAddress: user.publicAddress,
  };
}
