"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

const changeCodeSchema = z
  .object({
    currentCode: z.string().min(1, "Ingresá tu código actual"),
    newCode: z.string().min(4, "El código nuevo debe tener al menos 4 caracteres"),
    confirmCode: z.string().min(1),
  })
  .refine((data) => data.newCode === data.confirmCode, {
    message: "Los códigos nuevos no coinciden",
    path: ["confirmCode"],
  });

export type ChangeCodeState = { error: string | null; success: boolean };

export async function changeCodeAction(
  _prevState: ChangeCodeState,
  formData: FormData,
): Promise<ChangeCodeState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "No autenticado.", success: false };
  }

  const parsed = changeCodeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Datos inválidos",
      success: false,
    };
  }

  const [user] = await db.select().from(users).limit(1);
  if (!user) {
    return { error: "No se encontró el usuario.", success: false };
  }

  const currentMatches = await bcrypt.compare(
    parsed.data.currentCode,
    user.codeHash,
  );
  if (!currentMatches) {
    return { error: "El código actual no es correcto.", success: false };
  }

  const newCodeHash = await bcrypt.hash(parsed.data.newCode, 12);
  await db
    .update(users)
    .set({ codeHash: newCodeHash })
    .where(eq(users.id, user.id));

  return { error: null, success: true };
}
