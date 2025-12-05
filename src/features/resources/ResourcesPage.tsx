// Page ressources: téléversement et liste des fichiers par matière/semestre/niveau
import { LEVELS, SEMESTERS, SUBJECTS_30 } from '../../config/constants'
import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../auth/AuthContext'

export function ResourcesPage() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', subject: SUBJECTS_30[0], semester: SEMESTERS[0], level: LEVELS[0], url: '' })
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/resources')
        setList(res.data)
      } catch (err) {}
    })()
  }, [])

  async function handleAdd(e: any) {
    e?.preventDefault()
    try {
      const res = await api.post('/api/resources', form)
      setList(l => [res.data, ...l])
      setForm({ title: '', subject: SUBJECTS_30[0], semester: SEMESTERS[0], level: LEVELS[0], url: '' })
    } catch (err) {}
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/api/resources/${id}`)
      setList(l => l.filter(r => r._id !== id))
    } catch (err) {}
  }

  return (
    <div className="relative w-full">
      {/* Héros avec image pleine page */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ 
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          marginRight: 'calc(-50vw + 50%)'
        }}
        aria-label="Cours et ressources"
      >
        {/* Image de fond qui occupe toute la page de façon dynamique et fixe */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-fixed"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=1920&auto=format&fit=crop')",
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight whitespace-nowrap">
              Cours & Ressources
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Accédez à tous vos cours, documents et ressources pédagogiques en un seul endroit.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <a
                href="#content"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
              >
                Voir les ressources
              </a>
            </div>
          </div>
        </div>

        {/* Indicateur de scroll */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Section principale: formulaire d'upload et liste des derniers fichiers */}
      <section id="content" className="container-app py-12">
      <div className="card p-6">
        <h1 className="text-xl font-semibold text-primary-700">Cours & Ressources</h1>
        <p className="text-gray-600 mt-2">Upload, téléchargement, classement par matière et semestre.</p>
  <form className="mt-4 space-y-3" onSubmit={handleAdd}>
          <div>
            <label className="block text-sm font-medium text-gray-700"></label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="mt-1 w-full rounded border-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Matière</label>
            <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="mt-1 w-full rounded border-gray-300">
              {SUBJECTS_30.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Semestre</label>
            <select value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} className="mt-1 w-full rounded border-gray-300">
              {SEMESTERS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Niveau</label>
            <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="mt-1 w-full rounded border-gray-300">
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">URL du fichier</label>
            <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://... or relative path" className="mt-1 w-full rounded border-gray-300" />
          </div>
          {user?.role === 'Admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Fichier PDF</label>
              <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} className="mt-1" />
            </div>
          )}
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={!user}>Ajouter</button>
            {user?.role === 'Admin' && (
              <button type="button" className="btn-secondary" onClick={async () => {
                if (!file) return alert('Choisissez un fichier PDF');
                try {
                  const fd = new FormData();
                  fd.append('file', file);
                  fd.append('title', form.title);
                  fd.append('subject', form.subject);
                  fd.append('semester', form.semester);
                  fd.append('level', form.level);
                  const res = await api.post('/api/resources/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                  setList(l => [res.data, ...l]);
                  setForm({ title: '', subject: SUBJECTS_30[0], semester: SEMESTERS[0], level: LEVELS[0], url: '' });
                  setFile(null);
                } catch (err) {
                  console.error(err);
                  alert('Erreur lors de l\'upload');
                }
              }}>Téléverser PDF</button>
            )}
          </div>
        </form>
        <div className="mt-6">
          <h2 className="font-medium text-gray-800">Derniers fichiers</h2>
          <ul className="mt-2 text-sm text-gray-700 list-disc pl-5">
            {list.map(r => (
              <li key={r._id} className="flex items-center justify-between">
                <a className="text-primary-600 hover:underline" href={r.url || '#'} target="_blank" rel="noreferrer">{r.title}</a>
                {user?.role === 'Admin' && <button className="text-sm text-red-600" onClick={() => handleDelete(r._id)}>Supprimer</button>}
              </li>
            ))}
          </ul>
        </div>
      </div>
      </section>
    </div>
  )
}


