import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: '*.rule34.xxx', protocol: 'https' },
    ]
  }
};

export default nextConfig;
