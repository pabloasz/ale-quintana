"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

export type LoginState = { error: string | null };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      code: formData.get("code"),
      redirectTo: "/raffles",
    });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Código incorrecto." };
    }
    throw error;
  }
}
