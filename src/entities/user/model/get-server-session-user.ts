import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/features/auth/lib/better-auth";
import type { SessionUser } from "@/entities/user/types/session-user";

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export const serverAuth = async (): Promise<SessionUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session && session.user) {
    // Cast is safe: runtime data from DB always matches SessionUser shape.
    // Type mismatch is a TS inference artefact from the customSession spread.
    return session.user as unknown as SessionUser;
  }

  return null;
};

export const serverRequiredUser = async (): Promise<SessionUser> => {
  const user = await serverAuth();

  if (!user) {
    notFound();
  }

  return user;
};

