import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";

import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  code: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        code: { label: "Código de acceso", type: "password" },
      },
      authorize: async (rawCredentials) => {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { code } = parsed.data;
        const [user] = await db.select().from(users).limit(1);
        if (!user) return null;

        const codeMatches = await bcrypt.compare(code, user.codeHash);
        if (!codeMatches) return null;

        return { id: user.id };
      },
    }),
  ],
});
