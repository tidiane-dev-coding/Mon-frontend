import React, { FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../lib/api'

export function ResetPasswordPage() {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      if (!token) throw new Error('Lien invalide')
      if (password.length < 6) throw new Error('Minimum 6 caracteres')
      if (password !== confirm) throw new Error('Les mots de passe ne correspondent pas')

      const res = await api.post(`/api/auth/reset-password/${token}`, { password })
      setMessage(res.data?.message || 'Mot de passe mis a jour.')
      setPassword('')
      setConfirm('')
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Impossible de reinitialiser le mot de passe.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-app py-10">
      <div className="mx-auto max-w-md card p-6">
        <h1 className="text-xl font-semibold mb-4 text-primary-700">Reinitialiser le mot de passe</h1>
        {message && <p className="text-sm text-green-600 mb-3">{message}</p>}
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
            <input
              className="mt-1 w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 caracteres"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
            <input
              className="mt-1 w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Retapez le mot de passe"
              required
            />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Mise a jour...' : 'Mettre a jour'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          Retour a la <Link to="/login" className="text-primary-600 hover:underline">connexion</Link>
        </p>
      </div>
    </div>
  )
}

