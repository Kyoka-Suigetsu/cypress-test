import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import createJiti from "jiti";
import WebpackHookPlugin from "webpack-hook-plugin";

// Import env here to validate during build. Using jiti we can import .ts files :)
const jiti = createJiti(new URL(import.meta.url).pathname);
jiti("./src/env");

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const commitSHA = "$Format:%H$";

/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    useLightningcss: true,
    optimizePackageImports: ["react", "react-dom", "@nextui-org/react", "bcryptjs"],
  },
  transpilePackages: ['jotai-devtools'],
  compress: false,
  generateBuildId: commitSHA.startsWith("$Format") ? undefined : () => commitSHA,
  webpack: (config, { dev }) => {
    // The condition is to have the plugin on build time, not to perturb live refresh
    dev && config.plugins.push(new WebpackHookPlugin({
      onBuildStart: ['pnpx @spotlightjs/spotlight'],
    }));

    return config;
  },
};

const bundleConfig = bundleAnalyzer(nextConfig);

// Injected content via Sentry wizard below
export default withSentryConfig(
  bundleConfig,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,
    org: "lingopal",
    authToken: process.env.SENTRY_AUTH_TOKEN,
    project: "lingopal-rooms",
  },
  {
    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);