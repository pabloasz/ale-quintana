import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { asc, eq } from "drizzle-orm";

import { auth } from "@/auth";
import { db } from "@/db";
import { numbers, raffles } from "@/db/schema";
import { formatCOP, padNumber } from "@/lib/format";

export const runtime = "nodejs";

const WIDTH = 1080;
const CELL = 88;
const GAP = 8;
const COLUMNS = 10;

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  available: { bg: "#e7e2d6", fg: "#5c5646" },
  reserved: { bg: "#f6d98a", fg: "#6b4e05" },
  paid: { bg: "#bfe3c6", fg: "#1f5c30" },
};

let fontCache: { semibold: Buffer; extrabold: Buffer } | null = null;

async function loadFonts() {
  if (fontCache) return fontCache;
  const fontsDir = path.join(process.cwd(), "src/assets/fonts");
  const [semibold, extrabold] = await Promise.all([
    readFile(path.join(fontsDir, "Poppins-SemiBold.ttf")),
    readFile(path.join(fontsDir, "Poppins-ExtraBold.ttf")),
  ]);
  fontCache = { semibold, extrabold };
  return fontCache;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return new Response("No autenticado", { status: 401 });
  }

  const { id } = await params;
  const [raffle] = await db.select().from(raffles).where(eq(raffles.id, id));
  if (!raffle) {
    return new Response("Rifa no encontrada", { status: 404 });
  }

  const raffleNumbers = await db
    .select()
    .from(numbers)
    .where(eq(numbers.raffleId, id))
    .orderBy(asc(numbers.numberValue));

  const fonts = await loadFonts();
  const columns = Math.min(COLUMNS, raffle.gridSize);
  const gridWidth = columns * CELL + (columns - 1) * GAP;
  const rows = Math.ceil(raffle.gridSize / columns);
  const gridHeight = rows * CELL + Math.max(0, rows - 1) * GAP;
  const height = 520 + gridHeight;

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "56px 0",
          background: "linear-gradient(160deg, #fbf6e8 0%, #f3e3b8 45%, #e9c97a 100%)",
          fontFamily: "Poppins",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: gridWidth,
          }}
        >
          <span
            style={{
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 6,
              color: "#8a6a1e",
              textTransform: "uppercase",
            }}
          >
            Ale Quintana
          </span>
          <span
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "#241c10",
              textAlign: "center",
              marginTop: 6,
            }}
          >
            {raffle.title}
          </span>
          <span
            style={{
              fontSize: 34,
              fontWeight: 600,
              color: "#6b4e05",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            {raffle.prizeDescription}
          </span>

          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "rgba(255,255,255,0.6)",
                borderRadius: 16,
                padding: "16px 28px",
              }}
            >
              <span style={{ fontSize: 20, color: "#6b4e05" }}>Premio</span>
              <span style={{ fontSize: 34, fontWeight: 800, color: "#241c10" }}>
                {formatCOP(raffle.prizeValue)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "rgba(255,255,255,0.6)",
                borderRadius: 16,
                padding: "16px 28px",
              }}
            >
              <span style={{ fontSize: 20, color: "#6b4e05" }}>
                Valor del puesto
              </span>
              <span style={{ fontSize: 34, fontWeight: 800, color: "#241c10" }}>
                {formatCOP(raffle.pricePerNumber)}
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            width: gridWidth,
            gap: GAP,
            marginTop: 40,
          }}
        >
          {raffleNumbers.map((n) => {
            const colors = STATUS_COLORS[n.status];
            return (
              <div
                key={n.id}
                style={{
                  width: CELL,
                  height: CELL,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 10,
                  background: colors.bg,
                  color: colors.fg,
                  border:
                    n.id === raffle.winnerSlotId
                      ? "3px solid #b8912f"
                      : "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <span style={{ fontSize: 22, fontWeight: 800 }}>
                  {padNumber(n.numberValue, raffle.gridSize)}
                </span>
                {n.buyerName ? (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      maxWidth: CELL - 10,
                      overflow: "hidden",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {n.buyerName}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        <span
          style={{
            marginTop: 32,
            fontSize: 20,
            fontWeight: 600,
            color: "#8a6a1e",
          }}
        >
          Sorteos Oro 18k
        </span>
      </div>
    ),
    {
      width: WIDTH,
      height,
      fonts: [
        { name: "Poppins", data: fonts.semibold, weight: 600, style: "normal" },
        { name: "Poppins", data: fonts.extrabold, weight: 800, style: "normal" },
      ],
    },
  );
}
