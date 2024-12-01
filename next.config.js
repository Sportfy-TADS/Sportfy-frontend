// next.config.js

module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8081/:path*', // Proxy to Backend
      },
    ]
  },
  // ...existing code...
}