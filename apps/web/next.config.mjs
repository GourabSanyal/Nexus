/** @type {import('next').NextConfig} */
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

const rustApiUrl = process.env.RUST_API_URL ?? "http://localhost:9000";
console.log("[next.config] RUST_API_URL rewrite target:", rustApiUrl);

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/rust/:path*",
        destination: `${rustApiUrl}/:path*`,
      },
    ];
  },
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
