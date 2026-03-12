import type { NextConfig } from "next";

// Security response headers applied to all routes.
// See docs/SECURITY.md for rationale and https://nextjs.org/docs/app/api-reference/config/next-config-js/headers
//
// Content-Security-Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
// Strict-Transport-Security: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
// Referrer-Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
// X-Content-Type-Options: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
// X-Frame-Options: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
// Permissions-Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy
const isDev = process.env.NODE_ENV === "development";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  // Next.js dev mode requires 'unsafe-eval' for hot module replacement
  // 'wasm-unsafe-eval' is needed for ONNX WASM execution (semantic search)
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net${isDev ? " 'unsafe-eval'" : ""}`,
  isDev
    ? "connect-src 'self' ws: https://huggingface.co https://cdn-lfs.hf.co https://cdn-lfs-us-1.hf.co https://cdn-lfs.huggingface.co https://*.xethub.hf.co https://cdn.jsdelivr.net"
    : "connect-src 'self' https://huggingface.co https://cdn-lfs.hf.co https://cdn-lfs-us-1.hf.co https://cdn-lfs.huggingface.co https://*.xethub.hf.co https://cdn.jsdelivr.net",
  "worker-src 'self' blob:",
  "font-src 'self'",
  "frame-src https://www.youtube-nocookie.com https://giphy.com https://www.giphy.com",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=15768000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@opentelemetry/exporter-prometheus"],
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("@opentelemetry/exporter-prometheus");
    } else {
      // Prevent bundling Node built-ins for client-side @huggingface/transformers
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
