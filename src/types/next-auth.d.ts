import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** Стабильный идентификатор пользователя (Google `sub`) */
      id: string;
    } & DefaultSession["user"];
  }
}
