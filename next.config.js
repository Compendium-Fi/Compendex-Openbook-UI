/** @type {import('next').NextConfig} */
const withLess = require('next-with-less');
const withPlugins = require('next-compose-plugins');
const nextConfig = {
  reactStrictMode: true, webpack: (config, options) => {
    // Important: return the modified config
    if (!options.isServer) {
      config.resolve.fallback.fs = false
    }
    return config
  }
}

const plugins = [
  [
    withLess,
    {
      lessLoaderOptions: {},
    },
  ],
];

module.exports = withPlugins(plugins, nextConfig);

