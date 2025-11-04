import type { NextConfig } from "next";

const { IgnorePlugin } = require('webpack');

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // This solves the "Module not found: Can't resolve '@remotion/compositor-..." errors
    config.plugins.push(
      new IgnorePlugin({
        resourceRegExp: /^@remotion\/compositor-/,
      })
    );
    return config;
  }
};

export default nextConfig;
