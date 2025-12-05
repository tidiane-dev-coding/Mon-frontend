import React, { useEffect, useState } from 'react'
import { api, baseURL } from '../../lib/api'
import { useAuth } from '../../auth/AuthContext'

const LEVELS = ['L1', 'L2', 'L3', 'Master']

// Helper pour construire l'URL complète d'une image
function getImageUrl(url: string | undefined): string {
  const FALLBACK = 'https://randomuser.me/api/portraits/lego/1.jpg'
  if (!url || url.trim() === '') return FALLBACK

  const trimmed = url.trim()
  // Si c'est déjà une URL complète, la retourner telle quelle
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed

  // Utiliser le baseURL importé (normalisé sans slash terminal)
  const serverBase = (baseURL || 'http://localhost:5000').replace(/\/+$/, '')
  // Construire correctement l'URL (éviter les doubles slashes)
  if (trimmed.startsWith('/')) return `${serverBase}${trimmed}`
  return `${serverBase}/${trimmed}`
}

type Member = {
  _id?: string
  name: string
  role?: string
  photo?: string
  email?: string
  phone?: string
  level?: string
}

export default function CommitteePage() {
  const { user, token } = useAuth()
  const [level, setLevel] = useState<string>('L1')
  const [members, setMembers] = useState<Member[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Member>({ name: '', role: '', photo: '', email: '', phone: '' })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const res = await api.get(`/api/committees?level=${encodeURIComponent(level)}`)
        if (!mounted) return
        setMembers(res.data || [])
      } catch (err) {
        console.error('Failed to load committees', err)
        setMembers([])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [level])

  async function handleAdd(e?: React.FormEvent) {
    e?.preventDefault()
    if (!photoFile) {
      alert('Veuillez sélectionner une photo.')
      return
    }

    setUploading(true)
    try {
      // Upload de la photo
      const formData = new FormData()
      formData.append('photo', photoFile)
      // Use native fetch for file upload to avoid axios Content-Type boundary issues
      const fetchHeaders: any = {}
      if (token) fetchHeaders['Authorization'] = `Bearer ${token}`
      const fetchRes = await fetch(`${baseURL}/api/committees/upload-photo`, {
        method: 'POST',
        headers: fetchHeaders,
        body: formData,
      })
      if (!fetchRes.ok) {
        const bodyText = await fetchRes.text()
        throw new Error(`Upload failed: ${fetchRes.status} ${bodyText}`)
      }
      const uploadJson = await fetchRes.json()
      // Utiliser l'URL relative retournée par le backend
      const uploadedUrl = uploadJson.url
      // Convertir en URL complète si nécessaire pour éviter tout problème de résolution
      const photoUrl = uploadedUrl && uploadedUrl.startsWith('/') ? `${baseURL}${uploadedUrl}` : uploadedUrl

      // Créer le membre avec l'URL complète de la photo
      const res = await api.post('/api/committees', { 
        ...form, 
        photo: photoUrl,
        level 
      })
      setMembers(m => [res.data, ...m])
      setForm({ name: '', role: '', photo: '', email: '', phone: '' })
      setPhotoFile(null)
      setPhotoPreview(null)
      // Réinitialiser le champ file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      setShowForm(false)
    } catch (err: any) {
      console.error('Failed to add committee member', err)
      const serverMessage = err?.response?.data || err.message || String(err)
      alert('Erreur lors de l\'ajout du membre. Détails: ' + JSON.stringify(serverMessage))
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return
    try {
      await api.delete(`/api/committees/${id}`)
      setMembers(m => m.filter(x => x._id !== id))
    } catch (err) { console.error('Failed to delete', err) }
  }

  async function handleEdit(id?: string) {
    if (!id) return
    const newName = prompt('Nouveau nom')
    if (!newName) return
    try {
      const res = await api.put(`/api/committees/${id}`, { name: newName })
      setMembers(m => m.map(x => x._id === id ? res.data : x))
    } catch (err) { console.error('Failed to edit', err) }
  }

  return (
    <div className="relative w-full">
      {/* Héros avec image qui occupe toute la page */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ 
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)'
        }}
        aria-label="Comités par niveau"
      >
        {/* Image de fond qui occupe toute la page de façon dynamique et fixe */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-fixed"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1920&auto=format&fit=crop')",
            width: '100vw',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {/* Overlay avec dégradé pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/60" />
        </div>
        
        {/* Contenu centré sur l'image */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-white space-y-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              Comités par niveau
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Découvrez les membres des comités de classe pour chaque niveau
            </p>
          </div>
        </div>
      </section>

      {/* Section de contenu en dessous de l'image hero */}
      <section className="container-app py-12 space-y-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-primary-700">Comité</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm">Niveau</label>
            <select value={level} onChange={e => setLevel(e.target.value)} className="rounded border-gray-300">
              {LEVELS.map(l => <option key={l} value={l}>{l === 'Master' ? 'Master' : 'Licence ' + l.replace('L','')}</option>)}
            </select>
          </div>
        </div>

        {user?.role === 'Admin' && (
          <div className="mb-4">
            <button className="btn-primary" onClick={() => {
              setShowForm(s => !s)
              if (showForm) {
                setForm({ name: '', role: '', photo: '', email: '', phone: '' })
                setPhotoFile(null)
                setPhotoPreview(null)
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
                if (fileInput) fileInput.value = ''
              }
            }}>{showForm ? 'Annuler' : 'Ajouter membre'}</button>
          </div>
        )}

        {showForm && (
          <form className="mb-4 bg-gray-50 p-4 rounded border space-y-3" onSubmit={handleAdd}>
            <input placeholder="Nom" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded border-gray-300" />
            <input placeholder="Rôle" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full rounded border-gray-300" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setPhotoFile(file)
                    // Créer une prévisualisation de l'image
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setPhotoPreview(reader.result as string)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                className="mt-1 w-full rounded border-gray-300 text-sm"
                required
              />
              {photoFile && (
                <div className="mt-2">
                  <p className="text-xs text-green-600 mb-2">✓ Fichier sélectionné: {photoFile.name}</p>
                  {photoPreview && (
                    <img 
                      src={photoPreview} 
                      alt="Aperçu" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary-500"
                    />
                  )}
                </div>
              )}
            </div>
            <input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full rounded border-gray-300" />
            <input placeholder="Téléphone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full rounded border-gray-300" />
            <div className="flex gap-2">
              <button type="submit" className="btn-primary" disabled={uploading}>
                {uploading ? 'Téléchargement...' : 'Ajouter'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div>Chargement...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {members.map(m => (
              <div key={m._id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center border">
                <img 
                  src={getImageUrl(m.photo)} 
                  alt={m.name} 
                  className="w-20 h-20 rounded-full object-cover mb-2 border-2 border-primary-500"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement
                    if (!img.src.includes('randomuser.me')) {
                      // img.src = 'https://randomuser.me/api/portraits/lego/1.jpg'
                    }
                  }}
                />
                <div className="font-semibold text-primary-700">{m.name}</div>
                <div className="text-sm text-gray-600 mb-1">{m.role}</div>
                <div className="text-xs text-gray-500">{m.email}</div>
                <div className="text-xs text-gray-500">{m.phone}</div>
                {user?.role === 'Admin' && (
                  <div className="mt-2 flex gap-2">
                    <button className="text-sm text-primary-600" onClick={() => handleEdit(m._id)}>Modifier</button>
                    <button className="text-sm text-red-600" onClick={() => handleDelete(m._id)}>Supprimer</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <section>
          <h2 className="text-xl font-bold text-primary-700 mb-4">Contact central</h2>
          <p className="mb-2 text-gray-700">Pour toute question, contactez le secrétariat des comités : <a href="mailto:comite.dept@univ.edu" className="text-primary-600 underline">comite.dept@univ.edu</a>.</p>
        </section>
      </section>
    </div>
  )
}


