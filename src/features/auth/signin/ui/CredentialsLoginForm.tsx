"use client";
import { useForm } from "react-hook-form";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Label } from "@radix-ui/react-label";
import { zodResolver } from "@hookform/resolvers/zod";

import { useI18n } from "locales/client";
import { cn } from "@/shared/lib/utils";
import { paths } from "@/shared/constants/paths";
import { ProviderButton } from "@/features/auth/ui/ProviderButton";
import { loginSchema, LoginSchema } from "@/features/auth/signin/schema/signin.schema";
import { useSignIn } from "@/features/auth/signin/model/useSignIn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CredentialsLoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
  const t = useI18n();
  const searchParams = useSearchParams();
  const isResetSuccess = searchParams.get("reset") === "success";
  const redirectUrl = searchParams.get("redirect");

  const { signIn } = useSignIn();

  const { register, handleSubmit, formState } = useForm({ resolver: zodResolver(loginSchema) });
  const { errors, isSubmitting } = formState;

  async function onSubmit(values: LoginSchema) {
    return signIn(values);
  }

  return (
    <div className="space-y-6">
      {isResetSuccess && (
        <Alert className="bg-green-950/20 border-green-500/30 text-green-200" variant="success">
          <AlertDescription>{t("commons.password_reset_success")}</AlertDescription>
        </Alert>
      )}

      <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit(onSubmit)} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 animate-pulse">
            <span className="text-white text-3xl">🏋️</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{t("commons.login_to_your_account_title")}</h1>
          <p className="text-gray-400 text-balance text-sm">{t("commons.login_to_your_account_subtitle")}</p>
        </div>
        
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label className="text-gray-300 text-sm font-medium" htmlFor="email">Email</Label>
            <Input 
              id="email" 
              placeholder="m@example.com" 
              type="email" 
              {...register("email")} 
              aria-invalid={!!errors.email}
              className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
          </div>
          
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label className="text-gray-300 text-sm font-medium" htmlFor="password">{t("commons.password")}</Label>
              <a className="ml-auto text-sm text-indigo-400 hover:underline hover:text-indigo-300 underline-offset-4" href={`/${paths.forgotPassword}`}>
                {t("commons.password_forgot")}
              </a>
            </div>
            <Input 
              id="password" 
              type="password" 
              {...register("password")} 
              aria-invalid={!!errors.password}
              className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 py-3 rounded-lg shadow-lg shadow-indigo-600/30 transition-all duration-300" 
            disabled={isSubmitting} 
            size="large" 
            type="submit"
          >
            {isSubmitting ? t("commons.connecting") : t("commons.login")}
          </Button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#12112d] text-gray-400 px-2">{t("commons.or")}</span>
        </div>
      </div>

      <ProviderButton action="signin" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all duration-300" providerId="google" variant="outline" />

      <div className="text-center text-sm text-gray-400">
        {t("commons.dont_have_account")}{" "}
        <Link 
          className="underline underline-offset-4 text-indigo-400 hover:text-indigo-300" 
          href={`/${paths.signUp}${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
        >
          {t("commons.signup")}
        </Link>
      </div>
    </div>
  );
}

