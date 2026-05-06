import React, { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const res = await api.post('/api/auth/forgot-password', { email })
      setMessage(res.data?.message || 'Si cet email existe, un lien a ete envoye.')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Impossible d envoyer le lien pour le moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-app py-10">
      <div className="mx-auto max-w-md card p-6">
        <h1 className="text-xl font-semibold mb-4 text-primary-700">Mot de passe oublie</h1>
        <p className="text-sm text-gray-600 mb-4">Entrez votre email pour recevoir un lien de reinitialisation.</p>
        {message && <p className="text-sm text-green-600 mb-3">{message}</p>}
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              className="mt-1 w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              required
            />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          Retour a la <Link to="/login" className="text-primary-600 hover:underline">connexion</Link>
        </p>
      </div>
    </div>
  )
}

