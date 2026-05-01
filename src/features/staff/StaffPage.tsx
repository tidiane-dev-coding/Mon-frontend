// Page dédiée au personnel clé du département (direction et responsables)
import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { api, baseURL } from '../../lib/api'

type StaffMember = {
  _id?: string
  name: string
  title: string
  responsibility: string
  email: string
  phone: string
  office: string
  bio: string
  focus: string[]
  photo?: string
}

function getImageUrl(url: string | undefined): string | null {
  if (!url || url.trim() === '') return null
  const trimmed = url.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
  const serverBase = (baseURL || 'http://localhost:5000').replace(/\/+$/, '')
  if (trimmed.startsWith('/')) return `${serverBase}${trimmed}`
  return `${serverBase}/${trimmed}`
}

export function StaffPage() {
  const { user, token } = useAuth()
  const canManage = useMemo(() => user?.role === 'Admin' || user?.role === 'Professor', [user?.role])

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    title: '',
    responsibility: '',
    email: '',
    phone: '',
    office: '',
    bio: '',
    focusText: '',
  })

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const res = await api.get('/api/staff')
        if (!mounted) return
        setStaffMembers(res.data || [])
      } catch (err) {
        console.error('Failed to load staff', err)
        if (!mounted) return
        setStaffMembers([])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  function resetForm() {
    setForm({ name: '', title: '', responsibility: '', email: '', phone: '', office: '', bio: '', focusText: '' })
    setPhotoFile(null)
    setPhotoPreview(null)
    setEditingId(null)
    const fileInput = document.querySelector('input[type="file"][name="staffPhoto"]') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  function startAdd() {
    resetForm()
    setShowForm(true)
  }

  function startEdit(member: StaffMember) {
    setEditingId(member._id || null)
    setForm({
      name: member.name || '',
      title: member.title || '',
      responsibility: member.responsibility || '',
      email: member.email || '',
      phone: member.phone || '',
      office: member.office || '',
      bio: member.bio || '',
      focusText: Array.isArray(member.focus) ? member.focus.join(', ') : '',
    })
    setPhotoFile(null)
    setPhotoPreview(getImageUrl(member.photo))
    setShowForm(true)
  }

  function getAuthToken() {
    return token || localStorage.getItem('dm_auth_token')
  }

  function handleInvalidToken() {
    localStorage.removeItem('dm_auth_token')
    localStorage.removeItem('dm_auth_user')
    alert('Session expirée (token invalide). Reconnecte-toi.')
    window.location.href = '/login'
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault()
    if (!canManage) return

    setSaving(true)
    try {
      let photoUrl: string | undefined = undefined
      if (photoFile) {
        const formData = new FormData()
        formData.append('photo', photoFile)
        const uploadRes = await api.post('/api/staff/upload-photo', formData, {
          headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : undefined,
        })
        photoUrl = uploadRes.data?.url
      }

      const focus = form.focusText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

      const payload: any = {
        name: form.name,
        title: form.title,
        responsibility: form.responsibility,
        email: form.email,
        phone: form.phone,
        office: form.office,
        bio: form.bio,
        focus,
      }
      // Only override photo if a new one was uploaded
      if (photoUrl) payload.photo = photoUrl

      if (editingId) {
        const res = await api.put(`/api/staff/${editingId}`, payload, {
          headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : undefined,
        })
        setStaffMembers((m) => m.map((x) => (x._id === editingId ? res.data : x)))
      } else {
        const res = await api.post('/api/staff', payload, {
          headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : undefined,
        })
        setStaffMembers((m) => [...m, res.data])
      }

      resetForm()
      setShowForm(false)
    } catch (err: any) {
      console.error('Failed to add staff member', err)
      if (err?.response?.status === 401) {
        handleInvalidToken()
        return
      }
      alert(err?.message || 'Erreur lors de l’enregistrement du membre.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id?: string) {
    if (!id || !canManage) return
    if (!confirm('Supprimer ce membre ?')) return
    try {
      await api.delete(`/api/staff/${id}`, { headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : undefined })
      setStaffMembers((m) => m.filter((x) => x._id !== id))
    } catch (err) {
      console.error('Failed to delete staff member', err)
      if ((err as any)?.response?.status === 401) {
        handleInvalidToken()
        return
      }
      alert('Suppression échouée.')
    }
  }

  async function handleQuickPhotoChange(member?: StaffMember, file?: File | null) {
    if (!member?._id || !file || !canManage) return
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const uploadRes = await api.post('/api/staff/upload-photo', formData, {
        headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : undefined,
      })
      const uploadedUrl = uploadRes.data?.url

      const res = await api.put(
        `/api/staff/${member._id}`,
        { photo: uploadedUrl },
        { headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : undefined }
      )
      setStaffMembers((m) => m.map((x) => (x._id === member._id ? res.data : x)))
      alert('Photo mise à jour.')
    } catch (err: any) {
      console.error('Failed to quick-update photo', err)
      if (err?.response?.status === 401) {
        handleInvalidToken()
        return
      }
      alert(err?.message || 'Impossible de changer la photo.')
    }
  }

  return (
    <div className="relative w-full">
      {/* Hero immersif pleine largeur */}
      <section
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden rounded-3xl"
        style={{
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)'
        }}
        aria-label="Équipe du département"
      >
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&auto=format&fit=crop')",
            width: '100vw',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-primary-900/70 to-primary-950/80" />
          <div className="absolute right-10 top-10 w-48 h-48 bg-white/5 blur-3xl rounded-full" />
          <div className="absolute left-10 bottom-10 w-40 h-40 bg-primary-300/10 blur-3xl rounded-full" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white space-y-6">
          <p className="text-sm uppercase tracking-[0.4rem] text-primary-200">Direction & support</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">Les personnes ressources du département</h1>
          <p className="text-lg md:text-xl text-white/85">
            Un annuaire clair pour joindre rapidement la direction, la coordination pédagogique et l’appui administratif.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <a
              href="#staff-directory"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-500 transition-colors duration-200 rounded-lg font-semibold shadow-lg"
            >
              Voir les membres
            </a>
            <a
              href="#contact-staff"
              className="px-6 py-3 border border-white/40 hover:bg-white/10 rounded-lg font-semibold"
            >
              Contacter le secrétariat
            </a>
          </div>
        </div>
      </section>

      <div id="staff-directory" className="container-app py-12 space-y-10">
        <header className="card p-8 bg-gradient-to-r from-primary-50 to-white border-primary-100 relative overflow-hidden">
          <div className="absolute inset-y-0 right-0 w-48 bg-primary-100/60 blur-3xl" />
          <p className="text-sm uppercase tracking-wide text-primary-600 font-semibold">Personnel du département</p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900">L’équipe dirigeante & support</h2>
          <p className="mt-4 text-gray-600 max-w-3xl">
            Retrouvez les membres clés qui pilotent le département, leur rôle précis ainsi que les canaux de contact pour
            orienter vos demandes. Les photos et profils peuvent être ajoutés/modifiés par l’administration via l’interface.
          </p>
          {canManage && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <button className="btn-primary" onClick={() => (showForm ? setShowForm(false) : startAdd())}>
                {showForm ? 'Fermer' : 'Ajouter un membre'}
              </button>
              <p className="text-sm text-gray-500">
                Autorisé: <span className="font-semibold">Admin</span> / <span className="font-semibold">Professor</span>
              </p>
            </div>
          )}
          {canManage && showForm && (
            <form onSubmit={handleSave} className="mt-6 card p-6 border border-gray-100 bg-white space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-gray-600">Nom</label>
                  <input className="input mt-1 w-full" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Titre</label>
                  <input className="input mt-1 w-full" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Responsabilité</label>
                  <input className="input mt-1 w-full" value={form.responsibility} onChange={(e) => setForm((f) => ({ ...f, responsibility: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Bureau</label>
                  <input className="input mt-1 w-full" value={form.office} onChange={(e) => setForm((f) => ({ ...f, office: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <input className="input mt-1 w-full" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Téléphone</label>
                  <input className="input mt-1 w-full" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Bio</label>
                  <textarea className="input mt-1 w-full min-h-[90px]" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} required />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Focus (séparés par virgule)</label>
                  <input className="input mt-1 w-full" value={form.focusText} onChange={(e) => setForm((f) => ({ ...f, focusText: e.target.value }))} placeholder="Ex: Planification, Relations, Suivi" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Photo (optionnel)</label>
                  <div className="mt-2 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <input
                      name="staffPhoto"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setPhotoFile(file)
                        setPhotoPreview(file ? URL.createObjectURL(file) : null)
                      }}
                    />
                    {photoPreview && (
                      <img src={photoPreview} alt="Aperçu" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Enregistrer'}
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => {
                    resetForm()
                    setShowForm(false)
                  }}
                  disabled={saving}
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-3xl font-bold text-primary-700">{loading ? '…' : staffMembers.length}</p>
              <p className="text-gray-500 text-sm">Profils ajoutés</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-700">100%</p>
              <p className="text-gray-500 text-sm">Contact direct</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-700">24h</p>
              <p className="text-gray-500 text-sm">Délai moyen de réponse</p>
            </div>
          </div>
        </header>

        <section aria-label="Membres du personnel" className="grid gap-6 md:grid-cols-2">
          {staffMembers.map((member) => (
            <article key={member.email} className="card p-6 flex flex-col gap-4 hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-inner">
                  {member.photo ? (
                    <img
                      src={getImageUrl(member.photo) || ''}
                      alt={`Portrait de ${member.name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl font-semibold">
                      {member.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-primary-600 font-semibold">{member.title}</p>
                  <h2 className="text-xl font-bold text-gray-900">{member.name}</h2>
                  <p className="text-gray-600">{member.responsibility}</p>
                </div>
              </div>

              <p className="text-gray-700">{member.bio}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Contact</p>
                  <p className="text-gray-900 font-medium">{member.email}</p>
                  <p className="text-gray-900 font-medium">{member.phone}</p>
                </div>
                <div>
                  <p className="text-gray-500">Lieu d’accueil</p>
                  <p className="text-gray-900 font-medium">{member.office}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-medium mb-2">Focus prioritaires</p>
                <ul className="flex flex-wrap gap-2">
                  {member.focus.map((item) => (
                    <li key={item} className="px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {canManage && (
                <div className="pt-2 flex flex-wrap gap-2">
                  <button className="btn-secondary" onClick={() => startEdit(member)}>
                    Modifier
                  </button>
                  <label className="btn-secondary cursor-pointer">
                    Changer la photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        handleQuickPhotoChange(member, file)
                        e.currentTarget.value = ''
                      }}
                    />
                  </label>
                  <button className="btn-secondary" onClick={() => handleDelete(member._id)}>
                    Supprimer
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>

        <section
          id="contact-staff"
          className="card p-8 bg-gradient-to-r from-white to-gray-50 border-dashed border-2 border-gray-200 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="text-sm uppercase tracking-wide text-primary-600 font-semibold">Besoin d’un rendez-vous ?</p>
            <h3 className="mt-2 text-2xl font-semibold text-gray-900">Parlez directement au secrétariat</h3>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Envoyez un message ou planifiez un créneau pour être orienté vers la bonne personne (direction, programme, administratif).
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="mailto:secretariat.math@univ-math.edu" className="btn-primary">secretariat.math@univ-math.edu</a>
            <a href="tel:+221770000005" className="btn-secondary">+224 628 31 98 00</a>
          </div>
        </section>
      </div>
    </div>
  )
}


