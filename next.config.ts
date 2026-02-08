import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true, // Disable server-side image optimization to prevent ETXTBSY errors
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },

  // Production optimizations
  productionBrowserSourceMaps: false,
  compress: true,

  // Experimental memory optimizations
  experimental: {
    preloadEntriesOnStart: false, // Prevents memory leaks in Next.js 15.x
  },
}

export default nextConfig
