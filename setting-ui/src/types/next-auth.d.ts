import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  // eslint-disable-next-line no-unused-vars
  interface Session {
    accessToken?: string;
    user: {} & DefaultSession["user"];
  }

  // eslint-disable-next-line no-unused-vars
  interface User extends DefaultUser {
    access_token: string;
  }
}

declare module "next-auth/jwt" {
  // eslint-disable-next-line no-unused-vars
  interface JWT extends DefaultJWT {}
}
