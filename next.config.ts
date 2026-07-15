import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["portfolio.localtest.me"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
