import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  pgEnum,
  unique,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const raffleStatus = pgEnum("raffle_status", ["active", "finished"]);
export const numberStatus = pgEnum("number_status", [
  "available",
  "reserved",
  "paid",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  codeHash: text("code_hash").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const raffles = pgTable("raffles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  prizeDescription: text("prize_description").notNull(),
  prizeValue: integer("prize_value").notNull(),
  pricePerNumber: integer("price_per_number").notNull(),
  lotteryName: text("lottery_name").notNull(),
  prizeImageDataUrl: text("prize_image_data_url"),
  gridSize: integer("grid_size").notNull().default(100),
  status: raffleStatus("status").notNull().default("active"),
  drawDate: timestamp("draw_date"),
  winnerSlotId: uuid("winner_slot_id").references(
    (): AnyPgColumn => numbers.id,
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const numbers = pgTable(
  "numbers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    raffleId: uuid("raffle_id")
      .notNull()
      .references(() => raffles.id, { onDelete: "cascade" }),
    numberValue: integer("number_value").notNull(),
    buyerName: text("buyer_name"),
    buyerPhone: text("buyer_phone"),
    status: numberStatus("status").notNull().default("available"),
    notes: text("notes"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [unique().on(table.raffleId, table.numberValue)],
);

export const rafflesRelations = relations(raffles, ({ many, one }) => ({
  numbers: many(numbers),
  winnerSlot: one(numbers, {
    fields: [raffles.winnerSlotId],
    references: [numbers.id],
  }),
}));

export const numbersRelations = relations(numbers, ({ one }) => ({
  raffle: one(raffles, {
    fields: [numbers.raffleId],
    references: [raffles.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Raffle = typeof raffles.$inferSelect;
export type NewRaffle = typeof raffles.$inferInsert;
export type RaffleNumber = typeof numbers.$inferSelect;
export type NewRaffleNumber = typeof numbers.$inferInsert;
