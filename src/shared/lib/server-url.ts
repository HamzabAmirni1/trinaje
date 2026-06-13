import { SiteConfig } from "@/shared/config/site-config";

/**
 * This method return the server URL based on the environment.
 */
export const getServerUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // If NEXT_PUBLIC_APP_URL is defined (e.g. on Netlify or custom deployment), use it.
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // If we are in production, we return the production URL.
  if (process.env.VERCEL_ENV === "production") {
    return SiteConfig.prodUrl;
  }

  // If we are in "stage" environment, we return the staging URL.
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // If we are in development, we return the localhost URL.
  return "http://localhost:3000";
};
