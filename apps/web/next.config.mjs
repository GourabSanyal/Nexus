/** @type {import('next').NextConfig} */
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'

const nextConfig = {
    webpack:(config) => {
        config.plugins.push(new NodePolyfillPlugin())

        return config
    }
};

export default nextConfig;
