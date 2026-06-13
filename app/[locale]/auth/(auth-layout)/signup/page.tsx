import Link from "next/link";

import { getI18n } from "locales/server";
import { paths } from "@/shared/constants/paths";
import { SignUpForm } from "@/features/auth/signup/ui/signup-form";

export const metadata = {
  title: "Sign Up - Workout.cool",
  description: "Créez votre compte pour commencer",
};

export default async function AuthSignUpPage() {
  const t = await getI18n();

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 animate-pulse">
          <span className="text-white text-3xl">🏋️</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{t("register_title")}</h1>
        <p className="text-gray-400 text-sm max-w-sm">{t("register_description")}</p>
      </div>

      <SignUpForm />

      <div className="text-gray-400 mt-6 text-center text-xs">
        <p>
          {t("register_terms")}{" "}
          <Link className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4" href={paths.privacy}>
            {t("register_privacy")}
          </Link>{" "}
          .
        </p>
      </div>
    </div>
  );
}