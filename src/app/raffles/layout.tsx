import { Settings } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";

import { LogoutButton } from "./logout-button";

export default async function RafflesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/raffles" className="flex flex-col leading-tight">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-gold-dark">
              Ale Quintana
            </span>
            <span className="text-sm font-medium">Sorteos Oro 18k</span>
          </Link>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon">
              <Link href="/raffles/ajustes" aria-label="Ajustes">
                <Settings />
              </Link>
            </Button>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
