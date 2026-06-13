import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

export async function GET() {
  const status: Record<string, any> = {
    prismaClientInitialized: false,
    databaseConnectionOk: false,
    userCount: 0,
    error: null,
  };

  try {
    status.prismaClientInitialized = !!prisma;
    
    // Test simple count query
    const count = await prisma.user.count();
    status.userCount = count;
    status.databaseConnectionOk = true;
  } catch (err: any) {
    status.databaseConnectionOk = false;
    status.error = {
      message: err.message || err.toString(),
      code: err.code || null,
      meta: err.meta || null,
      stack: err.stack || null,
    };
  }

  return NextResponse.json(status);
}
