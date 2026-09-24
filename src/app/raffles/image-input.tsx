"use client";

import { useRef, useState } from "react";

import { Label } from "@/components/ui/label";

const MAX_DIMENSION = 1000;
const JPEG_QUALITY = 0.82;

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo procesar la imagen"));
          return;
        }
        // Fondo blanco por si la foto original es un PNG con transparencia
        // (el JPEG de salida no soporta canal alfa).
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.onerror = () => reject(new Error("No se pudo leer la imagen"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

export function ImageInput({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(defaultValue ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    try {
      const dataUrl = await resizeImage(file);
      setPreview(dataUrl);
    } catch {
      setError("No se pudo procesar la foto. Probá con otra.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleRemove() {
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`${name}-file`}>Foto del premio (opcional)</Label>
      <div className="flex items-center gap-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- vista previa de una data URL generada en el navegador, no un asset estático
          <img
            src={preview}
            alt="Foto del premio"
            className="size-20 rounded-lg border border-border object-cover"
          />
        ) : null}
        <div className="flex flex-1 flex-col gap-1">
          <input
            ref={inputRef}
            id={`${name}-file`}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleChange}
            className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
          />
          {preview ? (
            <button
              type="button"
              onClick={handleRemove}
              className="self-start text-xs text-muted-foreground underline"
            >
              Quitar foto
            </button>
          ) : null}
        </div>
      </div>
      {isProcessing ? (
        <p className="text-xs text-muted-foreground">Procesando foto...</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <input type="hidden" name={name} value={preview ?? ""} />
    </div>
  );
}
