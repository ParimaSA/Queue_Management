import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['127.0.0.1', "my-queue-bucket-isp.s3.amazonaws.com","img.daisyui.com"],
  },
};

export default nextConfig;