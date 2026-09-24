import "dotenv/config";
import bcrypt from "bcryptjs";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import { users } from "./schema";

async function main() {
  const code = process.env.SEED_ADMIN_CODE;

  if (!code) {
    console.error(
      "Definí SEED_ADMIN_CODE antes de correr este script.\n" +
        "Ejemplo: SEED_ADMIN_CODE=el-codigo-que-ella-elija npm run db:seed",
    );
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = postgres(process.env.DATABASE_URL, { max: 1 });
  const db = drizzle(client);

  const codeHash = await bcrypt.hash(code, 12);

  // Solo existe un usuario admin: se reemplaza cualquier código anterior.
  await db.transaction(async (tx) => {
    await tx.delete(users);
    await tx.insert(users).values({ codeHash });
  });

  console.log("Código de acceso configurado.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
