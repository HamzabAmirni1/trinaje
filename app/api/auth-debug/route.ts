import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { env } from "@/env";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const results: Record<string, any> = {};

  // 1. Test DB connection
  try {
    const userCount = await prisma.user.count();
    results.db = { ok: true, userCount };
  } catch (e: any) {
    results.db = { ok: false, error: e.message };
  }

  // 2. Test env vars
  results.env = {
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL || "MISSING",
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID ? "SET" : "MISSING",
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET ? "SET" : "MISSING",
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET ? "SET" : "MISSING",
    DATABASE_URL: process.env.DATABASE_URL ? "SET" : "MISSING",
  };

  // 3. Test auth module initialization
  try {
    const { auth } = await import("@/features/auth/lib/better-auth");
    results.authModule = { ok: true, type: typeof auth };
  } catch (e: any) {
    results.authModule = { ok: false, error: e.message, stack: e.stack };
  }

  // 4. Persisted auth errors from global
  results.persistedErrors = (globalThis as any).authErrors || [];

  return NextResponse.json(results, { status: 200 });
}
