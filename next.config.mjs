/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    // Configure domains for external images if needed
    domains: [],
    // Use remotePatterns for more flexible matching of external images
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'example.com' },
    // ],
  },
  outputoutput: 'standalone',
}

export default nextConfig
