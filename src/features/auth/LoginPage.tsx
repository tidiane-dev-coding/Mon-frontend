// Page de connexion: formulaire d'authentification et héros illustré
import { FormEvent, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth, type User } from '../../auth/AuthContext'
import { api } from '../../lib/api'

export function LoginPage() {
  const { login } = useAuth()
  const location = useLocation() as any
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<User['role']>('Student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/api/auth/login', { email, password })
      const { token, user } = res.data
      login(token, user)
      if (user.role !== role) {
        // warn if user selected a different role than the account
        alert(`Vous vous êtes connecté·e en tant que ${user.role} — vous aviez sélectionné ${role}.`)
      }
    } catch (err: any) {
      setError('Identifiants invalides')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Héros visuel avec image de fond pour la page de connexion */}
      <section
        className="relative overflow-hidden border-b border-gray-200"
        aria-label="Connexion"
      >
        <div
          className="h-[200px] sm:h-[240px] w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600&auto=format&fit=crop')",
          }}
        >
          <div className="h-full w-full bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
        </div>
        <div className="absolute inset-0 flex items-end p-6 container-app">
          <h1 className="text-2xl font-semibold text-white">Connexion</h1>
        </div>
      </section>
      {/* Bloc du formulaire de connexion */}
      <div className="container-app py-10">
      <div className="mx-auto max-w-md card p-6">
        <h1 className="text-xl font-semibold mb-4 text-primary-700">Connexion</h1>
        {location.state?.from && (
          <p className="text-sm text-gray-500 mb-2">Vous devez être connecté pour accéder à cette page.</p>
        )}
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Champs email et mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input className="mt-1 w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input className="mt-1 w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Je suis</label>
            <select className="mt-1 w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500" value={role} onChange={e => setRole(e.target.value as User['role'])}>
              <option value="Student">Étudiant</option>
              <option value="Professor">Professeur</option>
              <option value="Admin">Administrateur</option>
            </select>
          </div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Connexion…' : 'Se connecter'}</button>
        </form>
        <p className="mt-4 text-sm text-gray-600">Pas de compte ? <Link to="/register" className="text-primary-600 hover:underline">Inscrivez-vous</Link></p>
      </div>
      </div>
    </div>
  )
}


