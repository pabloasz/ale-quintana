import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/db";
import { numbers, raffles } from "@/db/schema";
import { formatCOP } from "@/lib/format";

async function getRafflesWithStats() {
  const rows = await db
    .select({
      id: raffles.id,
      title: raffles.title,
      prizeDescription: raffles.prizeDescription,
      prizeValue: raffles.prizeValue,
      pricePerNumber: raffles.pricePerNumber,
      status: raffles.status,
      createdAt: raffles.createdAt,
      winnerSlotId: raffles.winnerSlotId,
      gridSize: raffles.gridSize,
      sold: sql<number>`count(*) filter (where ${numbers.status} != 'available')`,
    })
    .from(raffles)
    .leftJoin(numbers, eq(numbers.raffleId, raffles.id))
    .groupBy(raffles.id)
    .orderBy(desc(raffles.createdAt));

  return rows;
}

export default async function RafflesPage() {
  const allRaffles = await getRafflesWithStats();
  const active = allRaffles.filter((r) => r.status === "active");
  const finished = allRaffles.filter((r) => r.status === "finished");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Rifas</h1>
        <Button asChild>
          <Link href="/raffles/new">Nueva rifa</Link>
        </Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Activas ({active.length})</TabsTrigger>
          <TabsTrigger value="finished">
            Finalizadas ({finished.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <RaffleList raffles={active} emptyLabel="No tenés rifas activas todavía." />
        </TabsContent>
        <TabsContent value="finished">
          <RaffleList
            raffles={finished}
            emptyLabel="Todavía no hay rifas finalizadas."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RaffleList({
  raffles: list,
  emptyLabel,
}: {
  raffles: Awaited<ReturnType<typeof getRafflesWithStats>>;
  emptyLabel: string;
}) {
  if (list.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {list.map((raffle) => (
        <Link key={raffle.id} href={`/raffles/${raffle.id}`}>
          <Card className="transition-colors hover:border-gold">
            <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
              <div>
                <CardTitle>{raffle.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {raffle.prizeDescription}
                </p>
              </div>
              <Badge variant={raffle.status === "active" ? "reserved" : "paid"}>
                {raffle.status === "active" ? "Activa" : "Finalizada"}
              </Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {Number(raffle.sold)}/{raffle.gridSize} números vendidos
              </span>
              <span className="font-medium text-gold-dark">
                Premio {formatCOP(raffle.prizeValue)}
              </span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
