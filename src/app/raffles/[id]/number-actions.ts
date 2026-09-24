"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { numbers, raffles } from "@/db/schema";
import { numberFormSchema } from "@/lib/raffle-schema";

async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado");
}

export async function updateNumberAction(
  raffleId: string,
  numberId: string,
  formData: FormData,
) {
  await requireSession();

  const parsed = numberFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { buyerName, buyerPhone, status, notes } = parsed.data;

  await db
    .update(numbers)
    .set({
      buyerName: buyerName || null,
      buyerPhone: buyerPhone || null,
      status,
      notes: notes || null,
      updatedAt: new Date(),
    })
    .where(and(eq(numbers.id, numberId), eq(numbers.raffleId, raffleId)));

  revalidatePath(`/raffles/${raffleId}`);
  return { error: null };
}

export async function setWinnerAction(raffleId: string, numberId: string) {
  await requireSession();

  await db
    .update(raffles)
    .set({ winnerSlotId: numberId, status: "finished", updatedAt: new Date() })
    .where(eq(raffles.id, raffleId));

  revalidatePath(`/raffles/${raffleId}`);
  revalidatePath("/raffles");
}
