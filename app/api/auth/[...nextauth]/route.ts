import NextAuth from "next-auth";
import { nextAuthConfig } from "./options";

const handler = NextAuth(nextAuthConfig);

export { handler as GET, handler as POST };
