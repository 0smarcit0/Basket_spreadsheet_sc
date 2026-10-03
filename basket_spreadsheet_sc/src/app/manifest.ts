import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Basket Spreadsheet SC',
    short_name: 'BasketSpreadsheet',
    description: 'Planilla para juegos de balonceto',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '../../public/web-app-manifest.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '../../public/web-app-manifest.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}