import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "campaign_keep_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 14;

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is missing. Add it to your .env file.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({
    email: user.email,
    displayName: user.displayName,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });

    if (!payload.sub || typeof payload.email !== "string" || typeof payload.displayName !== "string") {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      displayName: payload.displayName,
    };
  } catch {
    return null;
  }
}

export function getSessionCookieMaxAge() {
  return SESSION_AGE_SECONDS;
}
