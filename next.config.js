/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MOCK_AUTH: process.env.MOCK_AUTH
  }
}

module.exports = nextConfig 