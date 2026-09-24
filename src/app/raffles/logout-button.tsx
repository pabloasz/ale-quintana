"use client";

import { startTransition } from "react";

import { Button } from "@/components/ui/button";

import { logoutAction } from "./actions";

export function LogoutButton() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => startTransition(() => logoutAction())}
    >
      Salir
    </Button>
  );
}
