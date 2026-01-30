import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Image optimization settings to reduce file locking
    minimumCacheTTL: 60 * 60 * 24 * 7, // Cache optimized images for 7 days
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },

  // Production optimizations
  productionBrowserSourceMaps: false,
  compress: true,
}

export default nextConfig
