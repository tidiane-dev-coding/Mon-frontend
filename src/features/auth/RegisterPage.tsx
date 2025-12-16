// Page d'inscription: création de compte et choix du rôle
import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, type User } from '../../auth/AuthContext'
import { api } from '../../lib/api'

export function RegisterPage() {
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<User['role']>('Student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [emailInfo, setEmailInfo] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/api/auth/register', { name, email, password, role })
      const { token, user, autoLogin, emailSent: sent } = res.data

      // Affiche si le backend a réussi à envoyer l'email de confirmation
      if (typeof sent !== 'undefined') {
        setEmailSent(Boolean(sent))
        if (sent) setEmailInfo(`Un email de confirmation a été envoyé à ${email}`)
        else setEmailInfo("Impossible d'envoyer l'email de confirmation, vérifiez votre adresse ou contactez l'administrateur.")
      }

      // Si le backend renvoie directement un token + user, on connecte l'utilisateur
      if (token && user) {
        login(token, user)
        return
      }
      if (autoLogin && token && user) {
        login(token, user)
        return
      }
    } catch (err: any) {
      // try to show backend message when available
      const msg = err?.response?.data?.message || err?.message || 'Erreur d\'inscription'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Héros visuel avec image de fond pour l'inscription */}
      <section
        className="relative overflow-hidden border-b border-gray-200"
        aria-label="Inscription"
      >
        <div
          className="h-[200px] sm:h-[240px] w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1600&auto=format&fit=crop')",
          }}
        >
          <div className="h-full w-full bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
        </div>
        <div className="absolute inset-0 flex items-end p-6 container-app">
          <h1 className="text-2xl font-semibold text-white">Inscription</h1>
        </div>
      </section>
      {/* Bloc du formulaire d'inscription */}
      <div className="container-app py-10">
        <div className="mx-auto max-w-md card p-6">
        <h1 className="text-xl font-semibold mb-4 text-primary-700">Inscription</h1>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Champs nom, email, mot de passe et rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom complet</label>
            <input
              className="mt-1 w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Jean Dupont"
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              className="mt-1 w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              className="mt-1 w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mot de passe (minimum 6 caractères)"
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rôle</label>
            <select className="mt-1 w-full rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500" value={role} onChange={e => setRole(e.target.value as User['role'])}>
              <option value="Student">Étudiant</option>
              <option value="Professor">Professeur</option>
            </select>
          </div>
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Création…' : "S'inscrire"}</button>
        </form>
        {emailInfo && (
          <p className={`mt-4 text-sm ${emailSent ? 'text-green-600' : 'text-red-600'}`}>{emailInfo}</p>
        )}
        <p className="mt-4 text-sm text-gray-600">Déjà inscrit ? <Link to="/login" className="text-primary-600 hover:underline">Connectez-vous</Link></p>
      </div>
      </div>
    </div>
  )
}


