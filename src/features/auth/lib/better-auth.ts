import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";
import { UserRole } from "@prisma/client";

import { VerifyEmail } from "@emails/VerifyEmail";
import { ResetPasswordEmail } from "@emails/ResetPasswordEmail";
import { prisma } from "@/shared/lib/prisma";
import { sendEmail } from "@/shared/lib/mail/sendEmail";
import { hashStringWithSalt } from "@/features/update-password/lib/hash";
import { env } from "@/env";

export const auth = betterAuth({
  logger: {
    level: "error",
    log: (level, message, ...args) => {
      console.error(`[Better-Auth ${level}]: ${message}`, ...args);
      // Persist to global for /api/auth-debug
      const globalErrors = (globalThis as any).authErrors || [];
      globalErrors.push({
        timestamp: new Date().toISOString(),
        level,
        message,
        args: args.map((a) =>
          a instanceof Error
            ? { message: a.message, stack: a.stack, name: a.name }
            : typeof a === "object"
              ? JSON.stringify(a)
              : String(a)
        ),
      });
      if (globalErrors.length > 50) globalErrors.shift();
      (globalThis as any).authErrors = globalErrors;
    },
  },
  trustedOrigins: [
    env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
    "workoutcool://",
    "expo://",
  ],
  trustHeaders: true,
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  plugins: [
    admin(),
    nextCookies(),
  ],
  user: {
    additionalFields: {
      // NOTE: 'email' and 'name' are built-in Better Auth fields — do NOT add them here
      role: {
        type: "string",
      },
      firstName: {
        type: "string",
      },
      lastName: {
        type: "string",
      },
      isPremium: {
        type: "boolean",
        defaultValue: false,
      },
    },
  },
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: false, // FIXME: TEMPORARY
    sendVerificationEmail: async ({ user, url }, _req) => {
      try {
        const urlObject = new URL(url);
        const params = new URLSearchParams(urlObject.search);
        params.set("callbackURL", "/");
        urlObject.search = params.toString();
        const finalUrl = urlObject.toString();

        await sendEmail({
          to: user.email,
          subject: "Verify your email address",
          text: `Click the link to verify your email: ${finalUrl}`,
          react: VerifyEmail({ url: finalUrl }),
        });
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    },
  },
  emailAndPassword: {
    requireEmailVerification: false, // FIXME: TEMPORARY
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
        react: ResetPasswordEmail({ url }),
      });
    },
    password: {
      hash: async (password: string) => {
        const hashedPassword = hashStringWithSalt(password, env.BETTER_AUTH_SECRET);
        return hashedPassword;
      },
      verify: async ({ password, hash }) => {
        const hashedPassword = hashStringWithSalt(password, env.BETTER_AUTH_SECRET);
        return hashedPassword === hash;
      },
    },
    enabled: true,
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: async (profile) => {
        // Only return known fields — do NOT spread ...profile
        return {
          name: profile.name || `${profile.given_name || ""} ${profile.family_name || ""}`.trim(),
          email: profile.email,
          image: profile.picture || null,
          emailVerified: profile.email_verified ?? false,
          firstName: profile.given_name || "",
          lastName: profile.family_name || "",
          role: UserRole.user,
        };
      },
    },
  },
});
