/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  experimental: {
    // Increase timeout for API routes
    serverComponentsExternalPackages: ['cloudinary'],
  },
  // Configure API route timeouts
  async headers() {
    return [
      {
        source: '/api/upload',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
