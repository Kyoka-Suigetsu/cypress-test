// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { env } from "@/env";
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://01bc8bbc16a68eaadd0b54e3a89cb214@o4506145392427008.ingest.us.sentry.io/4506899165937664",
  environment: env.NEXT_PUBLIC_ENVIRONMENT,
  enabled: env.NEXT_PUBLIC_ENVIRONMENT !== "DEVELOPMENT",
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.05,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  spotlight: env.NODE_ENV === "development",

  release: "$Format:%H$",
});
