import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'awpumahome.com' },
      { protocol: 'https', hostname: 'cooler-living.com' },
      { protocol: 'https', hostname: '*.supabase.co' },  // for future Supabase Storage logos
      { protocol: 'https', hostname: '*.fal.media' },   // FAL AI generated images
      { protocol: 'https', hostname: 'fal.media' },
    ],
  },
}

export default nextConfig
