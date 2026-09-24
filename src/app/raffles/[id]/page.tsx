import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { numbers, raffles } from "@/db/schema";
import { formatCOP, padNumber, waLink } from "@/lib/format";

import { BoardGrid } from "./board-grid";
import { ShareBoardButton } from "./share-board-button";

async function getRaffle(id: string) {
  const [raffle] = await db.select().from(raffles).where(eq(raffles.id, id));
  if (!raffle) return null;

  const raffleNumbers = await db
    .select()
    .from(numbers)
    .where(eq(numbers.raffleId, id))
    .orderBy(asc(numbers.numberValue));

  return { raffle, numbers: raffleNumbers };
}

export default async function RaffleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getRaffle(id);
  if (!data) notFound();

  const { raffle, numbers: raffleNumbers } = data;

  const sold = raffleNumbers.filter((n) => n.status !== "available");
  const paid = raffleNumbers.filter((n) => n.status === "paid");
  const owing = raffleNumbers.filter((n) => n.status === "reserved");
  const collected = paid.length * raffle.pricePerNumber;
  const expectedTotal = raffle.gridSize * raffle.pricePerNumber;
  const winner = raffleNumbers.find((n) => n.id === raffle.winnerSlotId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          {raffle.prizeImageDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL guardada en la base, no un asset estático
            <img
              src={raffle.prizeImageDataUrl}
              alt="Foto del premio"
              className="size-16 shrink-0 rounded-lg border border-border object-cover"
            />
          ) : null}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{raffle.title}</h1>
              <Badge variant={raffle.status === "active" ? "reserved" : "paid"}>
                {raffle.status === "active" ? "Activa" : "Finalizada"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {raffle.prizeDescription}
            </p>
            <p className="text-xs text-muted-foreground">
              Juega con: {raffle.lotteryName}
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/raffles/${raffle.id}/edit`}>Editar</Link>
        </Button>
      </div>

      {winner ? (
        <Card className="border-gold bg-gold-light/40">
          <CardContent className="p-4 text-sm">
            🏆 Número ganador:{" "}
            <span className="font-semibold">
              {padNumber(winner.numberValue, raffle.gridSize)}
            </span>{" "}
            — {winner.buyerName ?? "sin nombre"}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          label="Premio"
          value={formatCOP(raffle.prizeValue)}
        />
        <SummaryCard
          label="Valor del puesto"
          value={formatCOP(raffle.pricePerNumber)}
        />
        <SummaryCard
          label="Vendidos"
          value={`${sold.length}/${raffle.gridSize}`}
        />
        <SummaryCard
          label="Recaudado"
          value={`${formatCOP(collected)} / ${formatCOP(expectedTotal)}`}
        />
      </div>

      {owing.length > 0 ? (
        <Card>
          <CardContent className="flex flex-col gap-2 p-4">
            <p className="text-sm font-semibold">
              Deben pago ({owing.length})
            </p>
            <ul className="flex flex-col gap-2">
              {owing.map((n) => (
                <li
                  key={n.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    #{padNumber(n.numberValue, raffle.gridSize)} —{" "}
                    {n.buyerName ?? "sin nombre"}
                  </span>
                  {n.buyerPhone ? (
                    <a
                      href={waLink(
                        n.buyerPhone,
                        `Hola${n.buyerName ? " " + n.buyerName : ""}, te escribo por el número ${padNumber(n.numberValue, raffle.gridSize)} de la rifa "${raffle.title}".`,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-gold-dark underline"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Tablero</p>
        <ShareBoardButton raffleId={raffle.id} title={raffle.title} />
      </div>

      <BoardGrid
        raffleId={raffle.id}
        gridSize={raffle.gridSize}
        initialNumbers={raffleNumbers}
        winnerSlotId={raffle.winnerSlotId}
      />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
