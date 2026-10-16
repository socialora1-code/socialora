/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      { source: '/instagram/buy-usa-followers', destination: '/buy-usa-instagram-followers', permanent: true },
      { source: '/instagram/buy-spanish-followers', destination: '/buy-spanish-instagram-followers', permanent: true },
      { source: '/instagram/buy-arabic-followers', destination: '/buy-arabic-instagram-followers', permanent: true },
      { source: '/instagram/buy-brazilian-followers', destination: '/buy-brazilian-instagram-followers', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          {
            key: 'Content-Security-Policy-Report-Only',
            value:
              "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'",
          },
        ],
      },
    ]
  },
}

export default nextConfig
