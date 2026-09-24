import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // La foto del premio viaja como data URL dentro del formulario de la rifa.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
