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
    suppressHydrationWarning: true,
  },
  reactStrictMode: true,
  transpilePackages: ["store", "zod", "constants"],
  webpack: (config) => {
    config.plugins.push(new NodePolyfillPlugin());
    config.devtool = "source-map";

    return config;
  },
};

export default nextConfig;
