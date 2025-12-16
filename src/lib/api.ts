import axios from 'axios'

// Déclare import.meta.env proprement pour TypeScript (Vite)
declare global {
  interface ImportMeta {
    env: Record<string, any>
  }
}

// API base URL — hardcoded for production to ensure Render uses correct backend
// DO NOT use localhost here — it breaks mobile/external access
export const baseURL = 'https://projet-dep-maths.onrender.com'

export const api = axios.create({
  baseURL,
  // No default Content-Type here: allow axios/browser to set the correct
  // header (and boundary) when sending FormData.
})

export default api
