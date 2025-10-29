/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    // allow the placeholder host used in development and any real remote avatars
    domains: ['via.placeholder.com'],
    // optional: if you need more flexible matching you can use remotePatterns
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'via.placeholder.com' },
    // ],
  },
}

export default nextConfig
