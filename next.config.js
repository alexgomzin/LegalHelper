/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MOCK_AUTH: process.env.MOCK_AUTH
  },
  publicRuntimeConfig: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  }
}

module.exports = nextConfig 