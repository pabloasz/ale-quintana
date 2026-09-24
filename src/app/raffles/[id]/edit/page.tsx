import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { numbers, raffles } from "@/db/schema";

import { updateRaffleAction } from "../../actions";
import { RaffleForm } from "../../raffle-form";
import { FinishControls } from "./finish-controls";

export default async function EditRafflePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [raffle] = await db.select().from(raffles).where(eq(raffles.id, id));
  if (!raffle) notFound();

  const raffleNumbers = await db
    .select({
      id: numbers.id,
      numberValue: numbers.numberValue,
      buyerName: numbers.buyerName,
    })
    .from(numbers)
    .where(eq(numbers.raffleId, id))
    .orderBy(asc(numbers.numberValue));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-lg font-semibold">Editar rifa</h1>
      </div>

      <RaffleForm
        mode="edit"
        action={updateRaffleAction.bind(null, raffle.id)}
        defaultValues={{
          title: raffle.title,
          prizeDescription: raffle.prizeDescription,
          prizeValue: raffle.prizeValue,
          pricePerNumber: raffle.pricePerNumber,
          lotteryName: raffle.lotteryName,
          prizeImageDataUrl: raffle.prizeImageDataUrl,
          gridSize: raffle.gridSize,
          drawDate: raffle.drawDate
            ? raffle.drawDate.toISOString().slice(0, 10)
            : undefined,
        }}
      />

      <FinishControls
        raffleId={raffle.id}
        status={raffle.status}
        gridSize={raffle.gridSize}
        winnerSlotId={raffle.winnerSlotId}
        numberOptions={raffleNumbers}
      />
    </div>
  );
}
