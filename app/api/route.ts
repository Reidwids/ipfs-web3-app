import { NextResponse } from "next/server";
export async function GET(request: Request) {
  return new NextResponse(
    JSON.stringify({ message: "IPFS API - Derek Reid", status: 200 }),
    { status: 200 }
  );
}
