import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { getI18n } from "locales/server";
import { paths } from "@/shared/constants/paths";
import { auth } from "@/features/auth/lib/better-auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { LayoutParams } from "@/shared/types/next";

export default async function AuthLayout(props: LayoutParams<{}>) {
  const t = await getI18n();

  const headerStore = await headers();
  const searchParams = Object.fromEntries(new URLSearchParams(headerStore.get("searchParams") || ""));
  const translatedError = t(`next_auth_errors.${searchParams.error}` as keyof typeof t);

  const user = await auth.api.getSession({ headers: headerStore });

  if (user) {
    redirect(`/${paths.root}`);
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {searchParams.error && (
        <Alert className="mb-4 bg-red-950/20 border-red-500/30 text-red-200" variant="error">
          <AlertTitle className="text-red-300 font-semibold">{translatedError}</AlertTitle>
          <AlertDescription className="text-red-400">{t("signin_error_subtitle")}</AlertDescription>
        </Alert>
      )}
      {props.children}
    </div>
  );
}
