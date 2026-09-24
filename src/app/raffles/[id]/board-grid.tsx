"use client";

import { startTransition, useOptimistic, useState } from "react";
import { toast } from "sonner";

import type { RaffleNumber } from "@/db/schema";
import { cn } from "@/lib/utils";
import { padNumber } from "@/lib/format";

import { setWinnerAction, updateNumberAction } from "./number-actions";
import { NumberSheet } from "./number-sheet";
import { STATUS_CELL_CLASS } from "./status-pill";

export function BoardGrid({
  raffleId,
  gridSize,
  initialNumbers,
  winnerSlotId,
}: {
  raffleId: string;
  gridSize: number;
  initialNumbers: RaffleNumber[];
  winnerSlotId: string | null;
}) {
  const [numbers, setOptimisticNumbers] = useOptimistic(
    initialNumbers,
    (state, updated: RaffleNumber) =>
      state.map((n) => (n.id === updated.id ? updated : n)),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = numbers.find((n) => n.id === selectedId) ?? null;

  const columns = Math.min(10, gridSize);

  function handleSave(
    numberId: string,
    formData: FormData,
    status: "available" | "reserved" | "paid",
  ) {
    const current = numbers.find((n) => n.id === numberId);
    if (!current) return;

    const optimistic: RaffleNumber = {
      ...current,
      buyerName: (formData.get("buyerName") as string) || null,
      buyerPhone: (formData.get("buyerPhone") as string) || null,
      notes: (formData.get("notes") as string) || null,
      status,
    };

    startTransition(async () => {
      setOptimisticNumbers(optimistic);
      const result = await updateNumberAction(raffleId, numberId, formData);
      if (result?.error) toast.error(result.error);
    });
  }

  function handleSetWinner(numberId: string) {
    startTransition(async () => {
      await setWinnerAction(raffleId, numberId);
      toast.success("Número ganador marcado. La rifa quedó finalizada.");
    });
  }

  return (
    <>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {numbers
          .slice()
          .sort((a, b) => a.numberValue - b.numberValue)
          .map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setSelectedId(n.id)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-md text-xs font-bold transition-transform active:scale-95",
                STATUS_CELL_CLASS[n.status],
                n.id === winnerSlotId && "ring-2 ring-gold ring-offset-1",
              )}
            >
              {padNumber(n.numberValue, gridSize)}
            </button>
          ))}
      </div>

      <NumberSheet
        number={selected}
        gridSize={gridSize}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onSave={handleSave}
        onSetWinner={handleSetWinner}
      />
    </>
  );
}
