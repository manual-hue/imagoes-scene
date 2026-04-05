const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/firestore\.googleapis\.com/,
      handler: 'NetworkFirst',
      options: { cacheName: 'firestore', networkTimeoutSeconds: 5 },
    },
    {
      urlPattern: /^https:\/\/firebasestorage\.googleapis\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'firebase-storage',
        expiration: { maxEntries: 100, maxAgeSeconds: 3 * 60 * 60 },
      },
    },
    {
      urlPattern: /\.(png|jpg|webp|svg|woff2)$/,
      handler: 'CacheFirst',
      options: { cacheName: 'static-assets' },
    },
  ],
});

module.exports = withPWA({
  images: {
    remotePatterns: [{ hostname: 'firebasestorage.googleapis.com' }],
  },
});
