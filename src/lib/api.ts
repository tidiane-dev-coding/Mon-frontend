import axios from 'axios'

declare global {
  interface ImportMeta {
    env: Record<string, string | boolean | undefined>
  }
}

/** API déployée sur Render (utilisée par défaut). */
export const RENDER_API_URL = 'https://projet-dep-maths.onrender.com'

/**
 * Par défaut : toujours Render (même en `npm run dev`).
 * Pour tester avec le backend local : dans `.env` mettre VITE_USE_LOCAL_API=true
 * (et lancer le backend sur le port 5000).
 */
function resolveApiBaseURL(): string {
  const useLocal = String(import.meta.env.VITE_USE_LOCAL_API || '').toLowerCase() === 'true'
  if (useLocal && import.meta.env.DEV) {
    return 'http://127.0.0.1:5000'
  }

  const fromEnv = String(import.meta.env.VITE_API_URL || '')
    .trim()
    .replace(/\/+$/, '')

  // Ne jamais utiliser localhost en prod / si l’URL env est vide
  if (fromEnv && !fromEnv.includes('localhost') && !fromEnv.includes('127.0.0.1')) {
    return fromEnv
  }

  return RENDER_API_URL
}

export const baseURL = resolveApiBaseURL()

if (import.meta.env.DEV) {
  console.info('[API] baseURL =', baseURL)
}

export const api = axios.create({
  baseURL,
})

export default api
