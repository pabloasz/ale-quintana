import "dotenv/config";
import bcrypt from "bcryptjs";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import { users } from "./schema";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Definí SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD antes de correr este script.\n" +
        "Ejemplo: SEED_ADMIN_EMAIL=ale@ejemplo.com SEED_ADMIN_PASSWORD=algo-seguro npm run db:seed",
    );
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  const passwordHash = await bcrypt.hash(password, 12);

  await db
    .insert(users)
    .values({ email, passwordHash })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash },
    });

  console.log(`Usuario admin listo: ${email}`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
