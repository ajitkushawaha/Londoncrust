import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'London Crust Admin',
    short_name: 'LC Admin',
    description: 'Admin dashboard for London Crust operations.',
    start_url: '/admin/dashboard',
    scope: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#dc2626',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon/android-icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon/android-icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/favicon/apple-icon-180x180.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'Open admin dashboard',
        url: '/admin/dashboard',
        icons: [{ src: '/favicon/android-icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Kitchen',
        short_name: 'Kitchen',
        description: 'Open kitchen screen',
        url: '/admin/dashboard/kitchen',
        icons: [{ src: '/favicon/android-icon-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Counter',
        short_name: 'Counter',
        description: 'Open counter screen',
        url: '/admin/dashboard/counter',
        icons: [{ src: '/favicon/android-icon-192x192.png', sizes: '192x192' }],
      },
    ],
  };
}
