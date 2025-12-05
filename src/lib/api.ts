import axios from 'axios'

// Déclare import.meta.env proprement pour TypeScript (Vite)
declare global {
  interface ImportMeta {
    env: Record<string, any>
  }
}

export const baseURL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000'

export const api = axios.create({
  baseURL,
  // No default Content-Type here: allow axios/browser to set the correct
  // header (and boundary) when sending FormData.
})

export default api
