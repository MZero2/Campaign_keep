import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  getSessionCookieMaxAge,
  SESSION_COOKIE_NAME,
  type SessionUser,
  verifySessionToken,
} from "@/lib/session-token";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return verifySessionToken(token);
}

export async function requireSessionUser() {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function persistSession(user: SessionUser) {
  const cookieStore = await cookies();
  const token = await createSessionToken(user);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionCookieMaxAge(),
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function loginWithCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user?.passwordHash) {
    return null;
  }

  const isValidPassword = await compare(password, user.passwordHash);
  if (!isValidPassword) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  } satisfies SessionUser;
}

export async function registerWithCredentials(input: {
  email: string;
  password: string;
  displayName: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    select: { id: true },
  });

  if (existingUser) {
    return null;
  }

  const passwordHash = await hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      displayName: input.displayName,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
    },
  });

  return user satisfies SessionUser;
}

export async function getCurrentUserRecord() {
  const session = await getSessionUser();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      displayName: true,
      createdAt: true,
    },
  });
}
