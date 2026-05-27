export const pwaConfig = {
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
  manifest: {
    name: 'School Bus Tracking',
    short_name: 'BusTrack',
    description: 'Premium School Bus Tracking System for Parents',
    theme_color: '#FACC15',
    background_color: '#000000',
    display: 'standalone',
    orientation: 'portrait',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  }
};
