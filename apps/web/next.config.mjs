/** @type {import('next').NextConfig} */
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const nextConfig = {
  experimental: {
    turbo: {
      resolveExtensions: [
        '.mdx',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.mjs',
        '.json',
      ],
    },
  },
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
  transpilePackages: ["store", "zod", "constants", "api", "rust-apis"],
  webpack: (config, { dir }) => {
    config.plugins.push(new NodePolyfillPlugin());
    config.devtool = "source-map";

    // Add resolve aliases so store package can import from web app
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": dir,
    };

    return config;
  },
};

export default nextConfig;
