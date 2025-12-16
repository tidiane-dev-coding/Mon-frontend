import axios from 'axios'

// Déclare import.meta.env proprement pour TypeScript (Vite)
declare global {
  interface ImportMeta {
    env: Record<string, any>
  }
}

// API base URL — uses env var VITE_API_URL if set, otherwise defaults to production URL
export const baseURL = (import.meta.env.VITE_API_URL as string) || 'https://projet-dep-maths.onrender.com'

export const api = axios.create({
  baseURL,
  // No default Content-Type here: allow axios/browser to set the correct
  // header (and boundary) when sending FormData.
})

export default api
