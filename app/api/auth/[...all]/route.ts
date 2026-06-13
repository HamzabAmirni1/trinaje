import { NextRequest } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/features/auth/lib/better-auth";

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
    throw error;
  }
}
