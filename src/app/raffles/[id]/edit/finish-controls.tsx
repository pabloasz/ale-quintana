"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { padNumber } from "@/lib/format";

import {
  deleteRaffleAction,
  finishRaffleAction,
  reopenRaffleAction,
} from "../../actions";

type NumberOption = {
  id: string;
  numberValue: number;
  buyerName: string | null;
};

export function FinishControls({
  raffleId,
  status,
  gridSize,
  winnerSlotId,
  numberOptions,
}: {
  raffleId: string;
  status: "active" | "finished";
  gridSize: number;
  winnerSlotId: string | null;
  numberOptions: NumberOption[];
}) {
  const router = useRouter();
  const [winnerId, setWinnerId] = useState(winnerSlotId ?? "");
  const [pending, setPending] = useState(false);

  function handleFinish() {
    setPending(true);
    startTransition(async () => {
      await finishRaffleAction(raffleId, winnerId || null);
      toast.success("Rifa finalizada.");
      setPending(false);
      router.refresh();
    });
  }

  function handleReopen() {
    setPending(true);
    startTransition(async () => {
      await reopenRaffleAction(raffleId);
      toast.success("Rifa reactivada.");
      setPending(false);
      router.refresh();
    });
  }

  function handleDelete() {
    if (
      !confirm(
        "¿Seguro que querés borrar esta rifa? Esta acción no se puede deshacer.",
      )
    )
      return;
    setPending(true);
    startTransition(async () => {
      await deleteRaffleAction(raffleId);
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="winner" className="text-sm font-medium">
          Número ganador
        </label>
        <select
          id="winner"
          value={winnerId}
          onChange={(e) => setWinnerId(e.target.value)}
          className="h-11 rounded-lg border border-border bg-card px-3 text-sm"
        >
          <option value="">Sin ganador todavía</option>
          {numberOptions.map((n) => (
            <option key={n.id} value={n.id}>
              {padNumber(n.numberValue, gridSize)}
              {n.buyerName ? ` — ${n.buyerName}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={handleFinish}
        >
          {status === "active" ? "Finalizar rifa" : "Actualizar ganador"}
        </Button>
        {status === "finished" ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={handleReopen}
          >
            Reactivar rifa
          </Button>
        ) : null}
        <Button
          type="button"
          variant="destructive"
          disabled={pending}
          onClick={handleDelete}
        >
          Borrar rifa
        </Button>
      </div>
    </div>
  );
}
