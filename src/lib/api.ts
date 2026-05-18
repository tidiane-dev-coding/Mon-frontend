import axios from 'axios'

// Déclare import.meta.env proprement pour TypeScript (Vite)
declare global {
  interface ImportMeta {
    env: Record<string, any>
  }
}

const DEFAULT_PROD_API = 'https://projet-dep-maths.onrender.com'

/** Base URL de l’API. En dev : chaîne vide → proxy Vite vers le backend local. En prod : VITE_API_URL au build, sinon Render. */
function resolveApiBaseURL(): string {
  const explicit = String((import.meta.env.VITE_API_URL as string) || '')
    .trim()
    .replace(/\/+$/, '')
  if (explicit) return explicit
  if (import.meta.env.DEV) return ''
  return DEFAULT_PROD_API
}

export const baseURL = resolveApiBaseURL()

export const api = axios.create({
  baseURL,
  // No default Content-Type here: allow axios/browser to set the correct
  // header (and boundary) when sending FormData.
})

export default api
