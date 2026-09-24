"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { auth, signOut } from "@/auth";
import { db } from "@/db";
import { numbers, raffles } from "@/db/schema";
import { raffleFormSchema } from "@/lib/raffle-schema";

async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export type ActionState = { error: string | null };

export async function createRaffleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = raffleFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { gridSize, drawDate, prizeImageDataUrl, ...rest } = parsed.data;

  const [raffle] = await db
    .insert(raffles)
    .values({
      ...rest,
      gridSize,
      drawDate: drawDate ? new Date(drawDate) : undefined,
      prizeImageDataUrl: prizeImageDataUrl || null,
    })
    .returning({ id: raffles.id });

  await db.insert(numbers).values(
    Array.from({ length: gridSize }, (_, i) => ({
      raffleId: raffle.id,
      numberValue: i,
    })),
  );

  revalidatePath("/raffles");
  redirect(`/raffles/${raffle.id}`);
}

export async function updateRaffleAction(
  raffleId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireSession();

  const parsed = raffleFormSchema
    .omit({ gridSize: true })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const { drawDate, prizeImageDataUrl, ...rest } = parsed.data;

  await db
    .update(raffles)
    .set({
      ...rest,
      drawDate: drawDate ? new Date(drawDate) : null,
      prizeImageDataUrl: prizeImageDataUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(raffles.id, raffleId));

  revalidatePath("/raffles");
  revalidatePath(`/raffles/${raffleId}`);
  redirect(`/raffles/${raffleId}`);
}

export async function finishRaffleAction(
  raffleId: string,
  winnerSlotId: string | null,
) {
  await requireSession();

  await db
    .update(raffles)
    .set({
      status: "finished",
      winnerSlotId: winnerSlotId ?? null,
      updatedAt: new Date(),
    })
    .where(eq(raffles.id, raffleId));

  revalidatePath("/raffles");
  revalidatePath(`/raffles/${raffleId}`);
}

export async function reopenRaffleAction(raffleId: string) {
  await requireSession();

  await db
    .update(raffles)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(raffles.id, raffleId));

  revalidatePath("/raffles");
  revalidatePath(`/raffles/${raffleId}`);
}

export async function deleteRaffleAction(raffleId: string) {
  await requireSession();

  await db.delete(raffles).where(eq(raffles.id, raffleId));

  revalidatePath("/raffles");
  redirect("/raffles");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
