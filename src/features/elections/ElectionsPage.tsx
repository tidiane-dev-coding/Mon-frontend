// Page élections: candidatures par poste, vote sécurisé, résultats finaux
import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api'
import { useAuth } from '../../auth/AuthContext'

type Poste = 'Président' | 'Vice-président' | 'Secrétaire' | 'Trésorier' | 'Chargé de l’information' | 'Chargé des affaires sociales' | 'Chargé de l’organisation' | 'Chargé du sport';

type Candidate = {
  _id?: string;
  id?: number | string;
  name: string;
  photo: string;
  motivation: string;
  poste: Poste;
  votes: number;
  level?: string;
};

const postes: Poste[] = [
  'Président',
  'Vice-président',
  'Secrétaire',
  'Trésorier',
  'Chargé de l’information',
  'Chargé des affaires sociales',
  'Chargé de l’organisation',
  'Chargé du sport',
];

const initialCandidates: Candidate[] = [
  {
    id: 1,
    name: 'Aminata Diallo',
    photo: 'https://randomuser.me/api/portraits/women/21.jpg',
    motivation: 'Je souhaite représenter les étudiants et améliorer la vie du campus.',
    poste: 'Président',
    votes: 12,
  },
  {
    id: 2,
    name: 'Moussa Camara',
    photo: 'https://randomuser.me/api/portraits/men/34.jpg',
    motivation: 'Je veux défendre vos intérêts et organiser plus d’activités.',
    poste: 'Vice-président',
    votes: 8,
  },
  {
    id: 3,
    name: 'Fatoumata Bah',
    photo: 'https://randomuser.me/api/portraits/women/56.jpg',
    motivation: 'Pour une meilleure communication entre étudiants et administration.',
    poste: 'Secrétaire',
    votes: 5,
  },
];

// Helper pour construire l'URL complète d'une image
function getImageUrl(url: string | undefined): string {
  if (!url || url.trim() === '') {
    console.warn('getImageUrl: URL vide, utilisation de l\'image par défaut');
    return 'https://randomuser.me/api/portraits/lego/1.jpg';
  }
  
  // Si c'est déjà une URL complète, la retourner telle quelle
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Si c'est une URL relative (commence par /), construire l'URL complète
  const baseURL = api.defaults.baseURL || 'https://projet-dep-maths.onrender.com';
  
  // Nettoyer l'URL pour éviter les doubles slashes
  let cleanUrl = url.trim();
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = `/${cleanUrl}`;
  }
  
  // Construire l'URL complète
  const fullUrl = `${baseURL}${cleanUrl}`;
  
  // Log pour déboguer si l'URL semble suspecte
  if (!url.startsWith('/uploads/') && !url.startsWith('http')) {
    console.log('getImageUrl - URL suspecte:', { original: url, cleaned: cleanUrl, full: fullUrl, baseURL });
  }
  
  return fullUrl;
}

export function ElectionsPage() {
  const { user, isAuthenticated } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [levelFilter, setLevelFilter] = useState('L1');
  const [selected, setSelected] = useState<{ [poste in Poste]?: number }>({});
  const [hasVoted, setHasVoted] = useState<{ [poste in Poste]?: boolean }>({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', motivation: '', poste: postes[0] });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/elections/candidates?level=${encodeURIComponent(levelFilter)}`);
        // normalize backend _id -> id to keep UI consistent
        const data = Array.isArray(res.data) ? res.data.map((c: any) => ({ ...c, id: c.id ?? c._id })) : []
        setCandidates(data);
      } catch (err) {
        // keep initial if error
      }
    })();
  }, [levelFilter]);

  function handleVote(poste: Poste) {
    if (selected[poste] == null || hasVoted[poste]) return;
    setCandidates(candidates => candidates.map(c => c.poste === poste && c.id === selected[poste] ? { ...c, votes: c.votes + 1 } : c));
    setHasVoted(hv => ({ ...hv, [poste]: true }));
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleAddCandidate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.motivation.trim() || !form.poste) return;
    if (!isAuthenticated) {
      alert('Vous devez être connecté·e pour déposer une candidature.')
      return
    }
    if (!photoFile) {
      alert('Veuillez sélectionner une photo.')
      return
    }

    setUploading(true);
    try {
      // Upload de la photo
      const formData = new FormData();
      formData.append('photo', photoFile);
      const uploadRes = await api.post('/api/elections/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Utiliser l'URL relative retournée par le backend (ex: /uploads/filename.jpg)
      // On construira l'URL complète seulement lors de l'affichage
      const uploadedUrl = uploadRes.data.url;

      // Créer le candidat avec l'URL relative de la photo
      const res = await api.post('/api/elections/candidates', {
        name: form.name,
        photo: uploadedUrl, // Sauvegarder l'URL relative
        motivation: form.motivation,
        poste: form.poste,
        level: levelFilter
      });
      // S'assurer que la photo est bien présente dans les données retournées
      const photoUrl = res.data.photo || uploadedUrl;
      const created = { 
        ...res.data, 
        id: res.data.id ?? res.data._id,
        votes: res.data.votes ?? 0,
        poste: res.data.poste ?? form.poste,
        level: res.data.level ?? levelFilter,
        photo: photoUrl // Utiliser l'URL de la photo
      };
      console.log('✅ Candidat créé avec succès:', {
        name: created.name,
        photo: created.photo,
        photoUrlComplete: getImageUrl(created.photo),
        poste: created.poste,
        level: created.level,
        id: created.id
      });
      
      // Tester si l'image est accessible immédiatement après création
      if (created.photo) {
        const testUrl = getImageUrl(created.photo);
        console.log('🔍 Test d\'accessibilité de l\'image:', testUrl);
        
        // Tester avec fetch
        fetch(testUrl, { method: 'HEAD', mode: 'cors' })
          .then(response => {
            console.log('📡 Réponse du serveur:', {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries()),
              url: testUrl
            });
            if (response.ok) {
              console.log('✅ Image accessible à:', testUrl);
            } else {
              console.warn('⚠️ Image non accessible (status:', response.status, ') à:', testUrl);
              // Essayer avec GET pour voir l'erreur complète
              return fetch(testUrl, { method: 'GET', mode: 'cors' });
            }
          })
          .then(response => {
            if (response && !response.ok) {
              console.error('❌ Détails de l\'erreur:', {
                status: response.status,
                statusText: response.statusText,
                url: testUrl
              });
            }
          })
          .catch(err => {
            console.error('❌ Erreur lors de la vérification de l\'image:', {
              message: err.message,
              name: err.name,
              url: testUrl,
              stack: err.stack
            });
          });
      }
      // Ajouter le candidat à la liste et forcer un re-render
      setCandidates(cands => {
        const newList = [created, ...cands];
        console.log('Liste mise à jour avec', newList.length, 'candidats');
        return newList;
      });
      setForm({ name: '', motivation: '', poste: postes[0] });
      setPhotoFile(null);
      setPhotoPreview(null);
      // Réinitialiser le champ file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setShowForm(false);
    } catch (err: any) {
      console.error('Failed to create candidate', err)
      alert('Impossible de créer le candidat. Vérifiez la console ou que vous êtes bien connecté.')
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteCandidate(id: number | string) {
    try {
      await api.delete(`/api/elections/candidates/${id}`);
      setCandidates(cands => cands.filter(c => String(c.id ?? c._id) !== String(id)));
    } catch (err) {}
  }

  async function handleEditCandidate(id: number | string, data: Partial<Candidate>) {
    try {
      const res = await api.put(`/api/elections/candidates/${id}`, data);
      const updated = { ...res.data, id: res.data.id ?? res.data._id }
      setCandidates(cands => cands.map(c => String(c.id ?? c._id) === String(id) ? updated : c));
    } catch (err) {}
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
        aria-label="Élections étudiantes"
      >
        {/* Image de fond qui occupe toute la page de façon dynamique et fixe */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-fixed"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1920&auto=format&fit=crop')",
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
              Élections étudiantes
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Élisez vos représentants étudiants et participez à la vie démocratique du département
            </p>
          </div>
        </div>
      </section>

      {/* Section de contenu en dessous de l'image hero */}
      <section className="container-app py-12 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-primary-700 mb-4">Présentation</h2>
          <p className="text-gray-700 mb-2">
            Cette page permet d'élire les représentants étudiants du département. Vous pouvez consulter les candidats, voter pour votre favori ou déposer votre candidature.
          </p>
        </div>

        <div>
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-bold text-primary-700">Liste des candidats par poste</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm">Niveau:</label>
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="rounded border-gray-300">
              <option value="L1">Licence 1</option>
              <option value="L2">Licence 2</option>
              <option value="L3">Licence 3</option>
              <option value="M1">Master 1</option>
              <option value="M2">Master 2</option>
            </select>
          </div>
          <button className="btn-primary" onClick={() => {
            setShowForm(f => !f);
            if (showForm) {
              setForm({ name: '', motivation: '', poste: postes[0] });
              setPhotoFile(null);
              setPhotoPreview(null);
              // Réinitialiser le champ file
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (fileInput) fileInput.value = '';
            }
          }}>
            {showForm ? 'Annuler' : 'Déposer une candidature'}
          </button>
        </div>
        {showForm && (
          <form className="mb-6 bg-gray-50 p-4 rounded border space-y-3" onSubmit={handleAddCandidate}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input name="name" value={form.name} onChange={handleFormChange} className="mt-1 w-full rounded border-gray-300" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setPhotoFile(file);
                    // Créer une prévisualisation de l'image
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setPhotoPreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
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
            <div>
              <label className="block text-sm font-medium text-gray-700">Poste</label>
              <select name="poste" value={form.poste} onChange={handleFormChange} className="mt-1 w-full rounded border-gray-300">
                {postes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Motivation</label>
              <textarea name="motivation" value={form.motivation} onChange={handleFormChange} className="mt-1 w-full rounded border-gray-300" rows={3} required />
            </div>
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? 'Téléchargement...' : 'Ajouter'}
            </button>
          </form>
        )}
        {postes.filter(poste => candidates.some(c => c.poste === poste && (c.level === levelFilter || !c.level))).map(poste => (
          <div key={poste} className="mb-8">
            <h3 className="text-lg font-semibold text-primary-600 mb-2">{poste}</h3>
            <div className="flex flex-row flex-wrap gap-6 overflow-x-auto pb-2">
              {candidates.filter(c => c.poste === poste && (c.level === levelFilter || !c.level)).map(c => (
                <div key={c._id ?? c.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center border">
                  <img 
                    src={getImageUrl(c.photo)} 
                    alt={c.name} 
                    className="w-20 h-20 rounded-full object-cover mb-2 border-2 border-primary-500"
                    loading="eager"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      const attemptedUrl = img.src;
                      const originalPhoto = c.photo;
                      const fullUrl = getImageUrl(originalPhoto);
                      
                      console.error('❌ Erreur de chargement de l\'image pour', c.name);
                      console.error('  - Photo originale (depuis DB):', originalPhoto);
                      console.error('  - URL complète construite (getImageUrl):', fullUrl);
                      console.error('  - URL tentée par le navigateur (img.src):', attemptedUrl);
                      console.error('  - Base URL API:', api.defaults.baseURL);
                      console.error('  - Candidat ID:', c._id ?? c.id);
                      
                      // Vérifier si l'URL est correcte
                      if (originalPhoto && originalPhoto.startsWith('/uploads/')) {
                        const expectedUrl = `${api.defaults.baseURL}${originalPhoto}`;
                        console.error('  - URL attendue:', expectedUrl);
                        console.error('  - URLs correspondent?', expectedUrl === attemptedUrl);
                        
                        // Essayer de recharger avec l'URL exacte
                        if (expectedUrl !== attemptedUrl) {
                          console.log('  → Tentative de correction de l\'URL...');
                          img.src = expectedUrl;
                          return; // Ne pas mettre l'image par défaut tout de suite
                        }
                      }
                      
                      // Utiliser une image par défaut seulement si ce n'est pas déjà une image par défaut
                      if (!attemptedUrl.includes('randomuser.me')) {
                        console.log('  → Utilisation de l\'image par défaut');
                        img.src = 'https://randomuser.me/api/portraits/lego/1.jpg';
                      }
                    }}
                    onLoad={() => {
                      console.log('✅ Image chargée avec succès pour', c.name);
                    }}
                  />
                  <div className="font-semibold text-primary-700">{c.name}</div>
                  <div className="text-xs text-gray-600 mb-1 italic">{c.motivation}</div>
                  <div className="mt-2 flex gap-2 items-center">
                    <input
                      type="radio"
                      name={`vote-${poste}`}
                      value={c._id ?? c.id}
                      checked={selected[poste] === (c._id ?? c.id)}
                      onChange={() => setSelected(sel => ({ ...sel, [poste]: c._id ?? c.id }))}
                      disabled={hasVoted[poste]}
                    />{' '}
                    <span className="text-sm">Sélectionner</span>
                  </div>
                  {user?.role === 'Admin' && (
                    <div className="mt-2 flex gap-2">
                      <button className="text-sm text-red-600" onClick={() => {
                        const id = c._id ?? c.id;
                        if (id !== undefined) handleDeleteCandidate(id);
                      }}>Supprimer</button>
                      <button className="text-sm text-primary-600" onClick={() => {
                        const id = c._id ?? c.id;
                        if (id !== undefined) {
                          const newName = prompt('Nouveau nom', c.name) || c.name;
                          handleEditCandidate(id, { name: newName });
                        }
                      }}>Modifier</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>

        <div>
          <h2 className="text-xl font-bold text-primary-700 mb-4">Vote</h2>
        <p className="text-gray-700 mb-2">Sélectionnez un candidat pour chaque poste puis cliquez sur « Voter ». Un seul vote par poste et par étudiant.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {postes.map(poste => (
            <div key={poste} className="bg-white rounded p-4 border flex flex-col items-center">
              <div className="font-semibold text-primary-700 mb-2">{poste}</div>
              <button
                className="btn-primary"
                onClick={() => handleVote(poste)}
                disabled={hasVoted[poste] || !selected[poste]}
              >
                {hasVoted[poste] ? 'Vote enregistré' : 'Voter'}
              </button>
            </div>
          ))}
        </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-primary-700 mb-4">Résultats</h2>
        {postes.map(poste => (
          <div key={poste} className="mb-8">
            <h3 className="text-lg font-semibold text-primary-600 mb-2">{poste}</h3>
            <div className="flex flex-row flex-wrap gap-6 overflow-x-auto pb-2">
              {candidates.filter(c => c.poste === poste && (c.level === levelFilter || !c.level)).length === 0 && (
                <div className="text-gray-400 italic">Aucun candidat pour ce poste.</div>
              )}
              {candidates.filter(c => c.poste === poste && (c.level === levelFilter || !c.level)).map(c => (
                <div key={c.id} className="bg-gray-50 rounded p-4 flex flex-col items-center border">
                  <div className="font-semibold text-primary-700">{c.name}</div>
                  <div className="text-xs text-gray-600 mb-1 italic">{c.motivation}</div>
                  <div className="text-lg font-bold text-primary-600 mt-2">{c.votes} vote(s)</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      </section>
    </div>
  );
}


