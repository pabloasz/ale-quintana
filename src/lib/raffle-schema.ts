import { z } from "zod";

export const raffleFormSchema = z.object({
  title: z.string().trim().min(1, "Poné un título para la rifa"),
  prizeDescription: z.string().trim().min(1, "Describí el premio"),
  prizeValue: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.coerce
      .number()
      .int()
      .positive("El valor estimado debe ser mayor a 0")
      .optional(),
  ),
  pricePerNumber: z.coerce
    .number()
    .int()
    .positive("El valor del puesto debe ser mayor a 0"),
  lotteryName: z.string().trim().min(1, "Indicá con qué lotería se juega"),
  prizeImageDataUrl: z
    .string()
    .max(3_000_000, "La foto es demasiado pesada")
    .refine((v) => v.startsWith("data:image/"), "Foto inválida")
    .optional()
    .or(z.literal("")),
  gridSize: z.coerce
    .number()
    .int()
    .min(10, "Mínimo 10 números")
    .max(1000, "Máximo 1000 números"),
  drawDate: z
    .string()
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export type RaffleFormValues = z.infer<typeof raffleFormSchema>;

export const numberFormSchema = z.object({
  buyerName: z.string().trim().max(200).optional().or(z.literal("")),
  buyerPhone: z.string().trim().max(40).optional().or(z.literal("")),
  status: z.enum(["available", "reserved", "paid"]),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type NumberFormValues = z.infer<typeof numberFormSchema>;
