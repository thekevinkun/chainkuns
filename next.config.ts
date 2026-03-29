import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: false, // disable disk cache — fixes WSL2 freeze
  },

  // ── Image Optimization ──
  images: {
    remotePatterns: [
      // Supabase Storage domains
      {
        protocol: "https",
        hostname: "nwxphwacfkzyjgbadcwv.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      // Pinata IPFS gateway — ticket images and event banners stored here
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
        pathname: "/ipfs/**",
      },

      // Public IPFS gateway — fallback if Pinata gateway is slow
      {
        protocol: "https",
        hostname: "ipfs.io",
        pathname: "/ipfs/**",
      },

      // Cloudflare IPFS gateway — fast CDN-backed IPFS
      {
        protocol: "https",
        hostname: "cloudflare-ipfs.com",
        pathname: "/ipfs/**",
      },
    ],
  },

  // ── Security Headers ──
  async headers() {
    return [
      {
        source: "/(.*)", // apply to all routes
        headers: [
          // Prevent clickjacking attacks (site can't be embedded in an iframe)
          { key: "X-Frame-Options", value: "DENY" },

          // Prevent browser from guessing file types (security best practice)
          { key: "X-Content-Type-Options", value: "nosniff" },

          // Control referrer information sent to external sites
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // Permissions policy — restrict access to sensitive browser APIs
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "thekevinkun",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
