import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpeg,jpg,woff2,woff,ttf}'],
        maximumFileSizeToCacheInBytes: 5000000, // 5MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              plugins: [
                {
                  cacheKeyWillBeUsed: async ({ request }: { request: Request }) => {
                    return `${request.url}?version=1`;
                  }
                }
              ]
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/www\.bokadirekt\.se\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'bokadirekt-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              networkTimeoutSeconds: 10,
              plugins: [
                {
                  cacheKeyWillBeUsed: async ({ request }: { request: Request }) => {
                    return `${request.url}?cache-bust=${Date.now()}`;
                  }
                }
              ]
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              }
            }
          }
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [
          /^\/_/,
          /\/[^/?]+\.[^/]+$/,
          /^\/api\//,
          /^\/offline\.html$/,
          /^\/sw\.js$/,
          /^\/manifest\.json$/
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        offlineGoogleAnalytics: true
      },
      includeAssets: [
        'favicon.ico',
        'offline.html',
        'logo.png',
        'favicon/favicon-96x96.png',
        'favicon/android-icon-48x48.png',
        'favicon/android-icon-72x72.png',
        'favicon/android-icon-96x96.png',
        'favicon/android-icon-144x144.png',
        'favicon/apple-icon-152x152.png',
        'favicon/android-icon-192x192.png',
        'favicon/1024x1024.png',
        'favicon/apple-icon-*.png',
        'staff/*.png',
        'browserconfig.xml'
      ],
      manifest: {
        name: 'Barberaria 96 - Professional Barbering Services',
        short_name: 'Barberaria 96',
        description: 'Barberaria 96 - Professional barbering services in Jönköping. Book your appointment online with Sweden\'s premier barber shop.',
        theme_color: '#1A1A1A',
        background_color: '#1A1A1A',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        categories: ['business', 'lifestyle', 'health', 'beauty', 'professional'],
        lang: 'sv-SE',
        dir: 'ltr',
        prefer_related_applications: false,
        edge_side_panel: {
          preferred_width: 400
        },
        launch_handler: {
          client_mode: 'navigate-existing'
        },
        handle_links: 'preferred',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        protocol_handlers: [
          {
            protocol: 'web+barberaria',
            url: '/?booking=%s'
          }
        ],
        file_handlers: [
          {
            action: '/',
            accept: {
              'text/calendar': ['.ics']
            }
          }
        ],
        share_target: {
          action: '/',
          method: 'GET',
          params: {
            title: 'title',
            text: 'text',
            url: 'url'
          }
        },
        screenshots: [
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            platform: 'wide',
            label: 'Barberaria 96 booking interface'
          },
          {
            src: '/logo.png',
            sizes: '512x512', 
            type: 'image/png',
            platform: 'narrow',
            label: 'Mobile booking experience'
          }
        ],
        icons: [
          // Any purpose icons
          {
            src: '/favicon/favicon-16x16.png', 
            sizes: '16x16',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/favicon/favicon-32x32.png', 
            sizes: '32x32',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/favicon/android-icon-36x36.png',
            sizes: '36x36', 
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/favicon/android-icon-48x48.png', 
            sizes: '48x48',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/favicon/android-icon-72x72.png', 
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/favicon/favicon-96x96.png', 
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/favicon/android-icon-144x144.png', 
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/favicon/android-icon-192x192.png', 
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/favicon/1024x1024.png', 
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/favicon/1024x1024.png', 
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any'
          },
          
          // Maskable purpose icons (separate entries for PWA Builder compliance)
          {
            src: '/favicon/android-icon-48x48.png', 
            sizes: '48x48',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/favicon/android-icon-72x72.png', 
            sizes: '72x72',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/favicon/favicon-96x96.png', 
            sizes: '96x96',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/favicon/apple-icon-152x152.png', 
            sizes: '152x152',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/favicon/android-icon-144x144.png', 
            sizes: '144x144',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/favicon/android-icon-192x192.png', 
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/favicon/1024x1024.png', 
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/favicon/1024x1024.png', 
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Boka tid',
            short_name: 'Boka',
            description: 'Boka din tid hos Barberaria 96',
            url: '/?action=book',
            icons: [
              {
                src: '/favicon/favicon-96x96.png',
                sizes: '96x96',
                type: 'image/png',
                purpose: 'any'
              }
            ]
          },
          {
            name: 'Om oss',
            short_name: 'Om oss',
            description: 'Läs mer om Barberaria 96',
            url: '/om-oss',
            icons: [
              {
                src: '/favicon/favicon-96x96.png',
                sizes: '96x96',
                type: 'image/png',
                purpose: 'any'
              }
            ]
          },
          {
            name: 'Kontakt',
            short_name: 'Kontakt', 
            description: 'Kontakta Barberaria 96',
            url: '/?action=contact',
            icons: [
              {
                src: '/favicon/favicon-96x96.png',
                sizes: '96x96',
                type: 'image/png',
                purpose: 'any'
              }
            ]
          },
          {
            name: 'Priser',
            short_name: 'Priser',
            description: 'Se våra priser och tjänster', 
            url: '/?action=prices',
            icons: [
              {
                src: '/favicon/favicon-96x96.png',
                sizes: '96x96',
                type: 'image/png',
                purpose: 'any'
              }
            ]
          }
        ],
        related_applications: [
          {
            platform: 'webapp',
            url: 'https://barbareria96.netlify.app/manifest.json'
          }
        ]
      },
      devOptions: {
        enabled: false
      },
      injectRegister: 'script',
      strategies: 'generateSW'
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['lucide-react'],
          motion: ['framer-motion']
        }
      }
    },
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin'
    }
  }
});