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
  reactStrictMode: true,
  transpilePackages: ["store", "zod"],
  webpack: (config) => {
    config.plugins.push(new NodePolyfillPlugin());
    config.devtool = "source-map";

    return config;
  },
};

export default nextConfig;
