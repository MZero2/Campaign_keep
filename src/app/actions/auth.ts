"use server";

import { redirect } from "next/navigation";

import {
  clearSession,
  loginWithCredentials,
  persistSession,
  registerWithCredentials,
} from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validators";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/login?error=invalid_input");
  }

  const sessionUser = await loginWithCredentials(parsed.data.email, parsed.data.password);
  if (!sessionUser) {
    redirect("/login?error=invalid_credentials");
  }

  await persistSession(sessionUser);
  redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect("/register?error=invalid_input");
  }

  const sessionUser = await registerWithCredentials(parsed.data);
  if (!sessionUser) {
    redirect("/register?error=email_taken");
  }

  await persistSession(sessionUser);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
