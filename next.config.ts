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

export default nextConfig;
