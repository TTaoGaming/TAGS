// 🚀 HANDSFREE CAMERA-MPE SERVICE WORKER
// Enables offline functionality and fast loading

const CACHE_NAME = 'handsfree-mpe-v1.0.0'
const OFFLINE_PAGE = '/offline.html'

// 📦 CORE FILES - Always cache these for offline functionality
const CORE_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './styles/base.css',
  './styles/panel.css'
]

// 🎵 AUDIO FILES - Cache popular instruments first
const AUDIO_CACHE = [
  // Piano (most popular)
  './sound-files/VCSL-Steinway-Piano/Left_Index_C2.wav',
  './sound-files/VCSL-Steinway-Piano/Left_Middle_E2.wav',
  './sound-files/VCSL-Steinway-Piano/Right_Index_E3.wav',
  './sound-files/VCSL-Steinway-Piano/Right_Middle_G3.wav',
  
  // Drums (second most popular)
  './sound-files/Heavy-Drums/Left_Index_Kick.wav',
  './sound-files/Heavy-Drums/Left_Middle_Snare.wav',
  './sound-files/Heavy-Drums/Right_Index_HiHatClosed.wav',
  './sound-files/Heavy-Drums/Right_Middle_CrashCymbal.wav'
]

// 🔧 JAVASCRIPT MODULES - Cache core modules
const JS_CACHE = [
  './js/core/',
  './js/modules/',
  './js/utils/'
]

// 📱 INSTALLATION - Set up caches when SW is installed
self.addEventListener('install', event => {
  console.log('🚀 Service Worker: Installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache core files
      caches.open(CACHE_NAME).then(cache => {
        console.log('📦 Service Worker: Caching core files')
        return cache.addAll(CORE_CACHE)
      }),
      
      // Cache essential audio files
      caches.open(CACHE_NAME + '-audio').then(cache => {
        console.log('🎵 Service Worker: Caching essential audio')
        return cache.addAll(AUDIO_CACHE.slice(0, 4)) // Cache first 4 for speed
      })
    ])
    .then(() => {
      console.log('✅ Service Worker: Installation complete')
      // Skip waiting to activate immediately
      self.skipWaiting()
    })
    .catch(error => {
      console.error('❌ Service Worker: Installation failed', error)
    })
  )
})

// 🔄 ACTIVATION - Clean up old caches
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== CACHE_NAME + '-audio') {
            console.log('🗑️ Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
    .then(() => {
      console.log('✅ Service Worker: Activation complete')
      // Take control of all pages immediately
      return self.clients.claim()
    })
  )
})

// 🌐 FETCH STRATEGY - Handle all network requests
self.addEventListener('fetch', event => {
  const request = event.request
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') return
  
  // Skip external requests (except MediaPipe CDN)
  if (!url.origin.includes(self.location.origin) && 
      !url.href.includes('cdn.jsdelivr.net/npm/@mediapipe')) {
    return
  }
  
  event.respondWith(handleRequest(request))
})

/**
 * 🎯 SMART CACHING STRATEGY
 * - Core files: Cache First (fastest)
 * - Audio files: Network First with Cache Fallback
 * - MediaPipe CDN: Network First with long-term cache
 * - Everything else: Network First with Cache Fallback
 */
async function handleRequest(request) {
  const url = new URL(request.url)
  const pathname = url.pathname
  
  try {
    // 📄 CORE FILES - Cache First (fastest loading)
    if (isCoreFile(pathname)) {
      return await cacheFirst(request)
    }
    
    // 🎵 AUDIO FILES - Network First with Cache Fallback
    if (isAudioFile(pathname)) {
      return await networkFirstWithCache(request, CACHE_NAME + '-audio')
    }
    
    // 🤖 MEDIAPIPE CDN - Network First with long cache
    if (url.href.includes('mediapipe')) {
      return await networkFirstWithCache(request, CACHE_NAME + '-external')
    }
    
    // 🔧 EVERYTHING ELSE - Network First with Cache Fallback
    return await networkFirstWithCache(request, CACHE_NAME)
    
  } catch (error) {
    console.error('❌ Service Worker: Request failed', pathname, error)
    
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('./index.html') || 
             new Response('App is offline. Please check your connection.', {
               status: 503,
               headers: { 'Content-Type': 'text/plain' }
             })
    }
    
    // Return generic offline response
    return new Response('Resource unavailable offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}

/**
 * 📦 CACHE FIRST STRATEGY
 * Check cache first, fallback to network if not found
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  const networkResponse = await fetch(request)
  
  // Cache successful responses
  if (networkResponse.ok) {
    const cache = await caches.open(CACHE_NAME)
    cache.put(request, networkResponse.clone())
  }
  
  return networkResponse
}

/**
 * 🌐 NETWORK FIRST WITH CACHE FALLBACK
 * Try network first, use cache if network fails
 */
async function networkFirstWithCache(request, cacheName = CACHE_NAME) {
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    throw error
  }
}

/**
 * 🔍 FILE TYPE HELPERS
 */
function isCoreFile(pathname) {
  return pathname === '/' || 
         pathname.includes('index.html') ||
         pathname.includes('manifest.json') ||
         pathname.includes('.css')
}

function isAudioFile(pathname) {
  return pathname.includes('sound-files') &&
         (pathname.endsWith('.wav') || pathname.endsWith('.mp3'))
}

/**
 * 📱 BACKGROUND SYNC - Cache additional resources when online
 */
self.addEventListener('sync', event => {
  if (event.tag === 'cache-audio') {
    event.waitUntil(cacheRemainingAudio())
  }
})

/**
 * 🎵 CACHE REMAINING AUDIO FILES
 * Cache additional audio files in background
 */
async function cacheRemainingAudio() {
  try {
    const cache = await caches.open(CACHE_NAME + '-audio')
    
    // Cache remaining audio files
    for (const audioUrl of AUDIO_CACHE.slice(4)) {
      try {
        const response = await fetch(audioUrl)
        if (response.ok) {
          await cache.put(audioUrl, response)
        }
      } catch (error) {
        console.warn('⚠️ Could not cache audio file:', audioUrl)
      }
    }
    
    console.log('🎵 Background audio caching complete')
  } catch (error) {
    console.error('❌ Background audio caching failed:', error)
  }
}

/**
 * 💾 CACHE SIZE MANAGEMENT
 * Keep cache size reasonable for mobile devices
 */
async function manageCacheSize() {
  const audioCache = await caches.open(CACHE_NAME + '-audio')
  const requests = await audioCache.keys()
  
  // If cache is getting large (>50 files), remove oldest
  if (requests.length > 50) {
    const oldestRequest = requests[0]
    await audioCache.delete(oldestRequest)
    console.log('🗑️ Removed old audio cache entry')
  }
}

/**
 * 📨 MESSAGE HANDLING - Communicate with main app
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_AUDIO') {
    // Cache specific audio file on demand
    const audioUrl = event.data.url
    caches.open(CACHE_NAME + '-audio').then(cache => {
      fetch(audioUrl).then(response => {
        if (response.ok) {
          cache.put(audioUrl, response)
        }
      })
    })
  }
})

console.log('🚀 Handsfree Camera-MPE Service Worker loaded') 