"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { changeCodeAction, type ChangeCodeState } from "./actions";

const initialState: ChangeCodeState = { error: null, success: false };

export function ChangeCodeForm() {
  const [state, formAction, isPending] = useActionState(
    changeCodeAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentCode">Código actual</Label>
        <Input id="currentCode" name="currentCode" type="password" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newCode">Código nuevo</Label>
        <Input id="newCode" name="newCode" type="password" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmCode">Confirmar código nuevo</Label>
        <Input id="confirmCode" name="confirmCode" type="password" required />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-status-paid-foreground">
          Código actualizado. La próxima vez que entres, usá el código nuevo.
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Guardando..." : "Cambiar código"}
      </Button>
    </form>
  );
}
