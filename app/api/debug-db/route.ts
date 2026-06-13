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
    
    // Test user table
    const userCount = await prisma.user.count();
    status.userCount = userCount;
    status.userTableOk = true;

    // Test session table
    const sessionCount = await prisma.session.count();
    status.sessionCount = sessionCount;
    status.sessionTableOk = true;

    // Test account table
    const accountCount = await prisma.account.count();
    status.accountCount = accountCount;
    status.accountTableOk = true;

    // Test verification table
    const verificationCount = await prisma.verification.count();
    status.verificationCount = verificationCount;
    status.verificationTableOk = true;

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
