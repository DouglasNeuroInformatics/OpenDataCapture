const path = require('path');

const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  output: 'standalone',
  swcMinify: true,
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../')
  },
  i18n: i18n,
  env: {
    NEXT_PUBLIC_LOGO_PATH: '/logo.png'
  }
};
