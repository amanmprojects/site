import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Parent Desktop/code has its own package-lock.json, so Next would otherwise
  // treat that folder as the Turbopack root and break client-manifest lookups
  // (e.g. builtin global-error). Pin root to this app directory.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
