import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["portfolio.localtest.me"],
  devIndicators: false,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
