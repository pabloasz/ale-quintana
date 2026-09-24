"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { ActionState } from "./actions";
import { ImageInput } from "./image-input";

const initialState: ActionState = { error: null };

export function RaffleForm({
  action,
  mode,
  defaultValues,
}: {
  action: (
    prevState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  mode: "create" | "edit";
  defaultValues?: {
    title: string;
    prizeDescription: string;
    pricePerNumber: number;
    lotteryName: string;
    prizeImageDataUrl?: string | null;
    gridSize: number;
    drawDate?: string | null;
  };
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="Sorteo Oro 18k - Septiembre"
          defaultValue={defaultValues?.title}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="prizeDescription">Premio</Label>
        <Textarea
          id="prizeDescription"
          name="prizeDescription"
          required
          placeholder="Cadena de oro 18k / iPhone 15 / $1.000.000 en efectivo"
          defaultValue={defaultValues?.prizeDescription}
        />
        <p className="text-xs text-muted-foreground">
          Puede ser plata, una prenda, un celular... lo que ella elija.
        </p>
      </div>

      <ImageInput
        name="prizeImageDataUrl"
        defaultValue={defaultValues?.prizeImageDataUrl}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pricePerNumber">Valor del puesto (COP)</Label>
        <Input
          id="pricePerNumber"
          name="pricePerNumber"
          type="number"
          min={1}
          required
          placeholder="20000"
          defaultValue={defaultValues?.pricePerNumber}
        />
      </div>

      {mode === "create" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="gridSize">Cantidad de números</Label>
          <Input
            id="gridSize"
            name="gridSize"
            type="number"
            min={10}
            max={1000}
            required
            defaultValue={defaultValues?.gridSize ?? 100}
          />
          <p className="text-xs text-muted-foreground">
            No se puede cambiar después de crear la rifa.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lotteryName">Lotería con la que se juega</Label>
        <Input
          id="lotteryName"
          name="lotteryName"
          required
          placeholder="Lotería de Boyacá"
          defaultValue={defaultValues?.lotteryName}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="drawDate">Fecha del sorteo (opcional)</Label>
        <Input
          id="drawDate"
          name="drawDate"
          type="date"
          defaultValue={defaultValues?.drawDate ?? undefined}
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <Button type="submit" size="lg" disabled={isPending}>
        {isPending
          ? "Guardando..."
          : mode === "create"
            ? "Crear rifa"
            : "Guardar cambios"}
      </Button>
    </form>
  );
}
