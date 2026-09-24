"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ShareBoardButton({
  raffleId,
  title,
}: {
  raffleId: string;
  title: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleShare() {
    setLoading(true);
    try {
      const res = await fetch(`/api/raffles/${raffleId}/board`);
      if (!res.ok) throw new Error("No se pudo generar la imagen");
      const blob = await res.blob();
      const file = new File([blob], `${title}.png`, { type: "image/png" });

      if (
        typeof navigator !== "undefined" &&
        navigator.canShare?.({ files: [file] })
      ) {
        await navigator.share({ files: [file], title });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      toast.error("No se pudo compartir el tablero. Probá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" size="sm" onClick={handleShare} disabled={loading}>
      {loading ? "Generando..." : "Compartir tablero"}
    </Button>
  );
}
