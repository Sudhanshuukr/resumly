import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Next.js 16 uses Turbopack by default. Setting this silences the
  // "webpack config with no turbopack config" warning.
  turbopack: {},
};

export default nextConfig;
