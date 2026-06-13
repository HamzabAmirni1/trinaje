import { NextRequest } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/features/auth/lib/better-auth";
import { prisma } from "@/shared/lib/prisma";

const handler = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
  try {
    return await handler.GET(request);
  } catch (error: any) {
    console.error("Better Auth GET Error:", error);
    const globalErrors = (globalThis as any).authErrors || [];
    globalErrors.push({
      timestamp: new Date().toISOString(),
      level: "handler_error_get",
      message: error.message || error.toString(),
      stack: error.stack || null
    });
    (globalThis as any).authErrors = globalErrors;

    try {
      await prisma.feedbacks.create({
        data: {
          review: 999,
          message: `[Better-Auth Handler GET Error] ${error.message || error.toString()} | Stack: ${error.stack || ""}`,
          email: "system-auth-error@workout.cool",
        }
      });
    } catch (dbErr) {
      console.error("Failed to log handler error to DB:", dbErr);
    }

    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handler.POST(request);
  } catch (error: any) {
    console.error("Better Auth POST Error:", error);
    const globalErrors = (globalThis as any).authErrors || [];
    globalErrors.push({
      timestamp: new Date().toISOString(),
      level: "handler_error_post",
      message: error.message || error.toString(),
      stack: error.stack || null
    });
    (globalThis as any).authErrors = globalErrors;

    try {
      await prisma.feedbacks.create({
        data: {
          review: 999,
          message: `[Better-Auth Handler POST Error] ${error.message || error.toString()} | Stack: ${error.stack || ""}`,
          email: "system-auth-error@workout.cool",
        }
      });
    } catch (dbErr) {
      console.error("Failed to log handler error to DB:", dbErr);
    }

    throw error;
  }
}
