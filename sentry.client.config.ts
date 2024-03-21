// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { env } from "@/env";
import * as Sentry from "@sentry/nextjs";
import * as Spotlight from "@spotlightjs/spotlight";

Sentry.init({
  dsn: "https://01bc8bbc16a68eaadd0b54e3a89cb214@o4506145392427008.ingest.us.sentry.io/4506899165937664",
  environment: env.NEXT_PUBLIC_ENVIRONMENT,
  enabled: env.NEXT_PUBLIC_ENVIRONMENT !== "DEVELOPMENT",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  replaysOnErrorSampleRate: 1.0,

  release: "$Format:%H$",

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.05,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});

if (env.NEXT_PUBLIC_ENVIRONMENT === "DEVELOPMENT") {
  Spotlight.init().catch(console.error);
}
