import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Allow product images pasted by admins from any https host
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
