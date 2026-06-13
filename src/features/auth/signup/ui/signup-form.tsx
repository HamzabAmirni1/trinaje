"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

import { useI18n } from "locales/client";
import { paths } from "@/shared/constants/paths";
import { ProviderButton } from "@/features/auth/ui/ProviderButton";
import { useSignUp } from "@/features/auth/signup/model/useSignUp";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useZodForm } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import { signUpSchema } from "../schema/signup.schema";

import type { SignUpSchema } from "../schema/signup.schema";

export const SignUpForm = () => {
  const t = useI18n();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const form = useZodForm({ schema: signUpSchema });

  const { signUp } = useSignUp();

  async function onSubmit(values: SignUpSchema) {
    if (values.password !== values.verifyPassword) {
      form.setError("verifyPassword", {
        message: "Password does not match",
      });
      return;
    }

    return signUp(values);
  }

  return (
    <>
      <Form
        className="max-w-lg space-y-4"
        form={form}
        onSubmit={async (values) => {
          return onSubmit(values);
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300 text-sm font-medium">{t("commons.first_name")}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="John" 
                    {...field} 
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300 text-sm font-medium">{t("commons.last_name")}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Doe" 
                    {...field} 
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </FormControl>
                <FormMessage className="text-red-400 text-xs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300 text-sm font-medium">{t("commons.email")}</FormLabel>
              <FormControl>
                <Input 
                  placeholder="john@doe.com" 
                  {...field} 
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300 text-sm font-medium">{t("commons.password")}</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  {...field} 
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="verifyPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300 text-sm font-medium">{t("commons.verify_password")}</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  {...field} 
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </FormControl>
              <FormMessage className="text-red-400 text-xs" />
            </FormItem>
          )}
        />

        <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 py-3 rounded-lg shadow-lg shadow-indigo-600/30 transition-all duration-300 mt-2" size="large" type="submit">
          {t("commons.submit")}
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#12112d] text-gray-400 px-2">{t("commons.or")}</span>
          </div>
        </div>
      </Form>
      
      <div className="mt-2 flex flex-col gap-2">
        <ProviderButton action="signup" providerId="google" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all duration-300" variant="default" />
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-400">
        {t("commons.already_have_account")}{" "}
        <Link 
          className="underline underline-offset-4 text-indigo-400 hover:text-indigo-300" 
          href={`/${paths.signIn}${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
        >
          {t("commons.login")}
        </Link>
      </div>
    </>
  );
};
