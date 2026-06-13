import { admin, customSession } from "better-auth/plugins";
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

async function logAuthErrorToDb(level: string, message: string, ...args: any[]) {
  try {
    const errorDetails = args.map(a => {
      if (a instanceof Error) {
        return { message: a.message, stack: a.stack, name: a.name };
      }
      if (typeof a === "object") {
        try { return JSON.parse(JSON.stringify(a)); } catch (_) { return String(a); }
      }
      return String(a);
    });

    await prisma.feedbacks.create({
      data: {
        review: 999,
        message: `[Better-Auth ${level}] ${message} | Details: ${JSON.stringify(errorDetails)}`,
        email: "system-auth-error@workout.cool",
      }
    });
  } catch (dbErr) {
    console.error("Failed to log auth error to DB:", dbErr);
  }
}

export const auth = betterAuth({
  logger: {
    level: "debug",
    log: (level, message, ...args) => {
      console.log(`[Better-Auth ${level}]:`, message, ...args);
      if (level === "error" || level === "warn") {
        logAuthErrorToDb(level, message, ...args);
        const globalErrors = (globalThis as any).authErrors || [];
        globalErrors.push({
          timestamp: new Date().toISOString(),
          level,
          message,
          args: args.map(a => {
            if (a instanceof Error) {
              return { message: a.message, stack: a.stack, name: a.name };
            }
            if (typeof a === "object") {
              try { return JSON.parse(JSON.stringify(a)); } catch (_) { return String(a); }
            }
            return a;
          })
        });
        if (globalErrors.length > 50) {
          globalErrors.shift();
        }
        (globalThis as any).authErrors = globalErrors;
      }
    }
  },
  trustedOrigins: [
    env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
    "workoutcool://",
    "expo://"
  ],
  trustHeaders: true,
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  plugins: [
    admin(),
    customSession(async ({ user, session }) => {
      console.log("⛏️ customSession executed - fetched from DB - whole user and session data is this ->> \n");
      const userFromDB = await prisma.user.findUnique({
        where: {
          id: user.id,
        },
        select: {
          id: true,
          email: true,
          emailVerified: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true,
          locale: true,
          role: true,
          banned: true,
          banReason: true,
          banExpires: true,
          isPremium: true,
          accounts: {
            select: { providerId: true },
          },
        },
      });

      return {
        user: userFromDB,
        session,
      };
    }),
    nextCookies(),
  ],
  user: {
    additionalFields: {
      email: {
        type: "string",
      },
      name: {
        type: "string",
      },
      role: {
        type: "string",
      },
      firstName: {
        type: "string",
      },
      lastName: {
        type: "string",
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

        // reconstruction
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
        return {
          ...profile,
          email: profile.email,
          firstName: profile.given_name || "",
          lastName: profile.family_name || "",
          role: UserRole.user,
        };
      },
    },
  },
});
