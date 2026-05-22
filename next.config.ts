import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/favicon.ico",
        destination: "/icon.png",
      },
    ];
  },
};

export default nextConfig;
