# Ale Quintana — Gestión de rifas

App para administrar las rifas de Ale Quintana: crear una rifa (premio, valor del puesto, cantidad de números), marcar quién compró cada número y su estado (disponible / reservado / pagado), ver un resumen de lo recaudado y generar el tablero como imagen para compartir por WhatsApp/Instagram, sin editarlo a mano.

Pensada para un solo usuario administrador (no hay vista pública ni auto-reserva de participantes). Ver el plan completo de diseño para más contexto de producto y decisiones técnicas.

## Stack

- **Next.js (App Router) + TypeScript** — frontend y backend en una sola app.
- **Postgres** vía **Drizzle ORM** (`drizzle-orm/postgres-js`, funciona igual en local y contra [Neon](https://neon.com) en producción).
- **Auth.js (NextAuth v5)** con proveedor Credentials (un único código de acceso, sin usuario/correo).
- **Tailwind CSS**, componentes propios estilo shadcn/ui (sin CLI, copiados a `src/components/ui`) y **Vaul** para el panel deslizable de edición de números.
- **`next/og` (`ImageResponse`)** para generar el tablero como PNG en `/api/raffles/[id]/board`.

## Requisitos

- Node.js 20+
- Una base de datos Postgres (local para desarrollo, [Neon](https://neon.com) recomendado para producción por su capa gratis)

## Configuración local

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Copiar `.env.example` a `.env` y completar:

   - `DATABASE_URL`: cadena de conexión a Postgres.
   - `AUTH_SECRET`: generar una con `npx auth secret`.

3. Aplicar el esquema a la base de datos:

   ```bash
   npm run db:migrate
   ```

4. Configurar el código de acceso (el que va a usar la administradora para entrar):

   ```bash
   SEED_ADMIN_CODE=el-codigo-que-ella-elija npm run db:seed
   ```

   Este script se puede volver a correr en cualquier momento (con otro código) para resetear el acceso.

5. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abrir [http://localhost:3000](http://localhost:3000) e iniciar sesión con el código del paso 4.

## Scripts útiles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm run start` | Build y servidor de producción |
| `npm run lint` | ESLint |
| `npm run db:generate` | Genera una migración nueva a partir de `src/db/schema.ts` |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:studio` | Abre [Drizzle Studio](https://orm.drizzle.team/drizzle-studio/overview) para explorar la base de datos |
| `npm run db:seed` | Crea o resetea el código de acceso |

## Deploy (Vercel + Neon)

1. Crear un proyecto en [Neon](https://neon.com) (capa gratis) y copiar la connection string **pooled** (con `-pooler` en el host).
2. Crear un proyecto en [Vercel](https://vercel.com) apuntando a este repo.
3. Configurar las variables de entorno en Vercel: `DATABASE_URL` (la de Neon) y `AUTH_SECRET`.
4. Correr `npm run db:migrate` y `npm run db:seed` apuntando a la base de Neon (con `DATABASE_URL` de producción en el entorno local, o desde la shell de Vercel) para crear las tablas y el código de acceso.
5. Deploy. La app queda disponible en el dominio de Vercel (se puede agregar un dominio propio después).

### Notas

- Si se olvida el código de acceso, se resetea corriendo de nuevo `npm run db:seed` con `DATABASE_URL` apuntando a producción — no hay flujo de recuperación automático (no hace falta para un solo usuario).
- La cantidad de números de una rifa (`grid_size`, 100 por defecto = "00" a "99") no se puede cambiar una vez creada la rifa.
- El endpoint que genera la imagen del tablero (`/api/raffles/[id]/board`) requiere sesión iniciada, igual que el resto de la app — lo que se comparte por WhatsApp/Instagram es el archivo de imagen descargado, no un link.
