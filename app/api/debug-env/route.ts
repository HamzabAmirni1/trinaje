import { NextResponse } from "next/server";

export async function GET() {
  const sanitize = (val: string | undefined) => {
    if (!val) return { exists: false, length: 0, preview: "undefined" };
    const hasQuotes = (val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"));
    const cleanVal = hasQuotes ? val.slice(1, -1) : val;
    return {
      exists: true,
      length: val.length,
      hasQuotes,
      hasSpaces: val.trim() !== val,
      preview: `${val.substring(0, 5)}...${val.substring(val.length - 5)}`,
      cleanPreview: `${cleanVal.substring(0, 5)}...${cleanVal.substring(cleanVal.length - 5)}`
    };
  };

  return NextResponse.json({
    authErrors: (globalThis as any).authErrors || [],
    BETTER_AUTH_URL: {
      raw: process.env.BETTER_AUTH_URL,
      hasQuotes: process.env.BETTER_AUTH_URL?.startsWith('"') || false
    },
    NEXT_PUBLIC_APP_URL: {
      raw: process.env.NEXT_PUBLIC_APP_URL,
      hasQuotes: process.env.NEXT_PUBLIC_APP_URL?.startsWith('"') || false
    },
    GOOGLE_CLIENT_ID: sanitize(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: sanitize(process.env.GOOGLE_CLIENT_SECRET),
    BETTER_AUTH_SECRET: sanitize(process.env.BETTER_AUTH_SECRET),
    DATABASE_URL: sanitize(process.env.DATABASE_URL),
    SMTP_HOST: process.env.SMTP_HOST || null,
    SMTP_PORT: process.env.SMTP_PORT || null,
    SMTP_USER: process.env.SMTP_USER || null,
    SMTP_FROM: process.env.SMTP_FROM || null,
    SMTP_PASS: sanitize(process.env.SMTP_PASS),
    SMTP_SECURE: process.env.SMTP_SECURE || null
  });
}
