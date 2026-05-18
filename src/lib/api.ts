import axios from 'axios'

// Déclare import.meta.env proprement pour TypeScript (Vite)
declare global {
  interface ImportMeta {
    env: Record<string, any>
  }
}

/** API en ligne (Render). Toujours utilisée — pas de localhost. */
export const RENDER_API_URL = 'https://projet-dep-maths.onrender.com'

export const baseURL = (
  String((import.meta.env.VITE_API_URL as string) || '')
    .trim()
    .replace(/\/+$/, '') || RENDER_API_URL
)

export const api = axios.create({
  baseURL,
})

export default api
