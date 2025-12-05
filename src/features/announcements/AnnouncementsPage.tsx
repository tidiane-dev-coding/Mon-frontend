// Page annonces: publication et fil d'actualités du département
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

type Announcement = { title: string; content: string; date: string };

export function AnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([{
    title: "Rentrée académique",
    content: "Début des cours le 20 octobre.",
    date: "10 Oct"
  }, {
    title: "Conférence d'algèbre",
    content: "Conférence le 30 octobre.",
    date: "15 Oct"
  }]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showOptionsIndex, setShowOptionsIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const now = new Date();
    const date = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
    (async () => {
      if (editIndex !== null) {
        // Modification
        const id = (announcements[editIndex] as any)?._id;
        if (id) {
          const res = await api.put(`/api/announcements/${id}`, { title, content });
          setAnnouncements(announcements => announcements.map((a, i) => i === editIndex ? res.data : a));
        }
        setEditIndex(null);
      } else {
        // Ajout
        const res = await api.post('/api/announcements', { title, content });
        setAnnouncements(prev => [res.data, ...prev]);
      }
    })()
    setTitle('');
    setContent('');
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/announcements');
        if (mounted) setAnnouncements(res.data);
      } catch (err) {
        // ignore for now
      }
    })();
    return () => { mounted = false }
  }, [])

  const handleEdit = (idx: number) => {
    setTitle(announcements[idx].title);
    setContent(announcements[idx].content);
    setEditIndex(idx);
  };

  const handleDelete = (idx: number) => {
    if (window.confirm('Supprimer cette annonce ?')) {
      (async () => {
        const id = (announcements[idx] as any)?._id;
        if (id) await api.delete(`/api/announcements/${id}`);
        setAnnouncements(announcements => announcements.filter((_, i) => i !== idx));
      })()
      // Si on supprime celle en cours d'édition, on reset le formulaire
      if (editIndex === idx) {
        setTitle('');
        setContent('');
        setEditIndex(null);
      }
    }
  };

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
        aria-label="Annonces"
      >
        {/* Image de fond qui occupe toute la page de façon dynamique et fixe */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-fixed"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1920&auto=format&fit=crop')",
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
              Annonces
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Restez informé des dernières actualités et annonces du département.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <a
                href="#content"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg"
              >
                Voir les annonces
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

      {/* Section principale: formulaire de publication et liste des annonces */}
      <section id="content" className="container-app py-12">
      <div className="card p-6">
        <h1 className="text-xl font-semibold text-primary-700">Annonces</h1>
        <p className="text-gray-600 mt-2">Fil d'actualités du département.</p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Titre</label>
            <input className="mt-1 w-full rounded border-gray-300" placeholder="Titre de l'annonce" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contenu</label>
            <textarea className="mt-1 w-full rounded border-gray-300" rows={4} placeholder="Votre message..." value={content} onChange={e => setContent(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">{editIndex !== null ? 'Modifier' : 'Publier'}</button>
          {editIndex !== null && (
            <button type="button" className="btn ml-2" onClick={() => { setTitle(''); setContent(''); setEditIndex(null); }}>Annuler</button>
          )}
        </form>
        <div className="mt-6">
          <h2 className="font-medium text-gray-800">Dernières annonces</h2>
          <ul className="mt-2 text-sm text-gray-700 list-disc pl-5">
            {announcements.map((a, i) => (
              <li key={i} className="mb-2 relative group">
                <span className="font-semibold">{a.title}</span> – {a.date}
                <div className="ml-2 text-gray-600">{a.content}</div>
                <button
                  className="btn btn-xs mt-1"
                  onClick={() => setShowOptionsIndex(showOptionsIndex === i ? null : i)}
                  aria-label="Options"
                >
                  ...
                </button>
                {showOptionsIndex === i && (
                  <div className="absolute z-10 bg-white border rounded shadow p-2 flex flex-col gap-1 right-0 top-8">
                    <button className="btn-secondary btn-xs text-left" onClick={() => { handleEdit(i); setShowOptionsIndex(null); }}>Modifier</button>
                    <button className="btn btn-xs text-left" onClick={() => { handleDelete(i); setShowOptionsIndex(null); }}>Supprimer</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      </section>
    </div>
  )
}


