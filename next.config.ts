import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Allow cross-origin HMR when the dev server is reached via this host
  // (e.g. remote/cloud IP) instead of localhost.
  allowedDevOrigins: ["13.207.6.58"],
  // Parent Desktop/code has its own package-lock.json, so Next would otherwise
  // treat that folder as the Turbopack root and break client-manifest lookups
  // (e.g. builtin global-error). Pin root to this app directory.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
