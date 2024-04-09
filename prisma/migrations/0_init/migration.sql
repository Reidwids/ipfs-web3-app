-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ipfs";

-- CreateTable
CREATE TABLE "ipfs"."File" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ipfs"."User" (
    "id" TEXT NOT NULL,
    "publicAddress" TEXT NOT NULL,
    "nonce" TEXT,
    "nonceExpiry" TIMESTAMP(3),
    "email" TEXT,
    "username" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_publicAddress_key" ON "ipfs"."User"("publicAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "ipfs"."User"("email");

-- AddForeignKey
ALTER TABLE "ipfs"."File" ADD CONSTRAINT "File_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ipfs"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

