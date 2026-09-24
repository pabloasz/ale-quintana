"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RaffleNumber } from "@/db/schema";
import { padNumber } from "@/lib/format";

import { StatusPills } from "./status-pill";

type Status = "available" | "reserved" | "paid";

export function NumberSheet({
  number,
  gridSize,
  open,
  onOpenChange,
  onSave,
  onSetWinner,
}: {
  number: RaffleNumber | null;
  gridSize: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (numberId: string, formData: FormData, status: Status) => void;
  onSetWinner: (numberId: string) => void;
}) {
  const [status, setStatus] = useState<Status>(number?.status ?? "available");

  if (!number) return null;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      onAnimationEnd={(nextOpen) => {
        if (nextOpen) setStatus(number.status);
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col rounded-t-2xl bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] outline-none">
          <div className="mx-auto mb-3 h-1.5 w-12 shrink-0 rounded-full bg-border" />
          <Drawer.Title className="text-base font-semibold">
            Número {padNumber(number.numberValue, gridSize)}
          </Drawer.Title>
          <form
            className="mt-4 flex flex-col gap-4 overflow-y-auto"
            action={(formData) => {
              formData.set("status", status);
              onSave(number.id, formData, status);
              onOpenChange(false);
            }}
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="buyerName">Nombre</Label>
              <Input
                id="buyerName"
                name="buyerName"
                autoFocus
                placeholder="Nombre del comprador"
                defaultValue={number.buyerName ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="buyerPhone">Teléfono (WhatsApp)</Label>
              <Input
                id="buyerPhone"
                name="buyerPhone"
                type="tel"
                placeholder="3001234567"
                defaultValue={number.buyerPhone ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Estado</Label>
              <StatusPills value={status} onChange={setStatus} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Ej: pagó la mitad"
                defaultValue={number.notes ?? ""}
              />
            </div>
            <Button type="submit" size="lg">
              Guardar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!number.buyerName) {
                  toast.error("Asigná un comprador antes de marcarlo ganador.");
                  return;
                }
                onSetWinner(number.id);
                onOpenChange(false);
              }}
            >
              Marcar como número ganador
            </Button>
          </form>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
