// Page de gestion des utilisateurs: liste avec actions basiques (création/modification)
import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { baseURL, api } from '../../lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  avatarUrl?: string;
};

const placeholderAvatar = new URL('../../assets/default-avatar.svg', import.meta.url).href;

const initialUsers: (User & { online?: boolean })[] = [
  {
    id: '1',
    name: 'Amadou Tidiane Bah',
    email: 'admin@univ.com',
    role: 'Admin',
    phone: '+224 622 29 23 70',
    avatarUrl: placeholderAvatar,
    online: true,
  },
  {
    id: '2',
    name: 'Prof One',
    email: 'prof1@univ.com',
    role: 'Professor',
    phone: '+224 620 00 00 02',
    avatarUrl: placeholderAvatar,
    online: false,
  },
  {
    id: '3',
    name: 'Student One',
    email: 'etudiant1@univ.com',
    role: 'Student',
    phone: '+224 620 00 00 03',
    avatarUrl: placeholderAvatar,
    online: true,
  },
];

export function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<(User & { online?: boolean })[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Student', phone: '', avatarUrl: '' });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  function handleFormChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAvatarUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // keep data URL for preview, but store actual File to upload
      setForm(prev => ({ ...prev, avatarUrl: result }));
      setAvatarPreview(result);
      setAvatarFile(file);
    };
    reader.readAsDataURL(file);
  }

  async function handleAddUser(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.role.trim()) return;
    try {
  // Create user on backend. Generate a temporary password so backend (which requires password)
  // accepts the creation and returns a real user id.
  const tempPassword = Math.random().toString(36).slice(-8);
  const payload = { name: form.name, email: form.email, role: form.role, phone: form.phone, password: tempPassword };
  const res = await api.post('/api/users', payload);
      const created = res.data && (res.data.user || res.data) ;

      let finalUser = created;

      // If user created and there's a file to upload, send it
      if (created && avatarFile) {
        const fd = new FormData();
        fd.append('avatar', avatarFile);
        try {
          const up = await api.post(`/api/users/${created._id || created.id}/avatar`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          if (up.data && up.data.user) finalUser = up.data.user;
        } catch (uerr) {
          console.error('Avatar upload failed', uerr);
        }
      }

      // Add to UI list (use server result to get real id and avatarUrl)
      setUsers(us => [
        ...us,
        {
          id: finalUser._id || finalUser.id || (us.length + 1).toString(),
          name: finalUser.name || form.name,
          email: finalUser.email || form.email,
          role: finalUser.role || form.role,
          phone: finalUser.phone || form.phone,
          // Use server-provided avatarUrl and add a cache-buster to force browser reload
          avatarUrl: finalUser.avatarUrl
            ? `${finalUser.avatarUrl}${finalUser.avatarUrl.includes('?') ? '&' : '?'}t=${Date.now()}`
            : (form.avatarUrl || avatarPreview || placeholderAvatar),
          online: false,
        },
      ]);

      // reset form
      setForm({ name: '', email: '', role: 'Student', phone: '', avatarUrl: '' });
      setAvatarPreview('');
      setAvatarFile(null);
      setShowForm(false);
    } catch (err: any) {
      console.error('Failed to create user', err);
      // fallback: local add
      setUsers(us => [
        ...us,
        {
          id: (us.length + 1).toString(),
          name: form.name,
          email: form.email,
          role: form.role,
          phone: form.phone,
          avatarUrl: form.avatarUrl || avatarPreview || placeholderAvatar,
          online: false,
        },
      ]);
      setForm({ name: '', email: '', role: 'Student', phone: '', avatarUrl: '' });
      setAvatarPreview('');
      setAvatarFile(null);
      setShowForm(false);
    }
  }

  function handleRoleChange(id: string, newRole: string) {
    setUsers(us => us.map(u => u.id === id ? { ...u, role: newRole } : u));
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm mb-8">
        <div className="h-[180px] w-full bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1600&auto=format&fit=crop')" }}>
          <div className="h-full w-full bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
        </div>
        <div className="absolute inset-0 flex items-end p-6">
          <h1 className="text-2xl font-semibold text-white">Gestion des utilisateurs</h1>
        </div>
      </section>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-primary-700">Utilisateurs</h1>
        {user?.role === 'Admin' && (
          <button className="btn-primary" onClick={() => setShowForm(f => !f)}>
            {showForm ? 'Annuler' : 'Créer un utilisateur'}
          </button>
        )}
      </div>
      {showForm && (
        <form className="mb-6 bg-gray-50 p-4 rounded border space-y-3" onSubmit={handleAddUser}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input name="name" value={form.name} onChange={handleFormChange} className="mt-1 w-full rounded border-gray-300" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input name="email" value={form.email} onChange={handleFormChange} className="mt-1 w-full rounded border-gray-300" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Téléphone</label>
            <input name="phone" value={form.phone} onChange={handleFormChange} className="mt-1 w-full rounded border-gray-300" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rôle</label>
            <select name="role" value={form.role} onChange={handleFormChange} className="mt-1 w-full rounded border-gray-300">
              <option>Student</option>
              <option>Professor</option>
              <option>Admin</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Photo du profil</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 border">
                <img
                  src={
                    // if avatar is a backend path like /uploads/..., prefix with baseURL
                    avatarPreview || (form.avatarUrl || placeholderAvatar).startsWith('/uploads')
                      ? `${baseURL}${form.avatarUrl || avatarPreview || '/uploads/default-avatar.svg'}`
                      : form.avatarUrl || avatarPreview || placeholderAvatar
                  }
                  alt="Prévisualisation"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="btn-secondary cursor-pointer">
                Importer une photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  setAvatarPreview('');
                  setForm(prev => ({ ...prev, avatarUrl: '' }));
                }}
                className="text-sm text-gray-500 underline"
              >
                Réinitialiser
              </button>
            </div>
            <p className="text-xs text-gray-500">Formats acceptés : JPG, PNG, WebP. Taille max 2 Mo.</p>
            <input
              name="avatarUrl"
              value={form.avatarUrl}
              onChange={handleFormChange}
              className="mt-1 w-full rounded border-gray-300"
              placeholder="Ou collez un lien https://..."
            />
          </div>
          <button type="submit" className="btn-primary">Ajouter</button>
        </form>
      )}
      <input
        className="mb-4 w-full rounded border-gray-300 p-2"
        placeholder="Rechercher par nom, email ou rôle..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map(u => (
          <div key={u.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center border">
            <img src={(u.avatarUrl || placeholderAvatar).startsWith('/uploads') ? `${baseURL}${u.avatarUrl}` : (u.avatarUrl || placeholderAvatar)} alt={u.name} className="w-20 h-20 rounded-full object-cover mb-2 border-2 border-primary-500" />
            <div className="font-semibold text-primary-700">{u.name}</div>
            <div className="text-sm text-gray-600 mb-1">{u.role}</div>
            <div className="text-xs text-gray-500">{u.email}</div>
            <div className="text-xs text-gray-500">{u.phone}</div>
            <div className="mt-2 flex gap-2 items-center">
              <span className={u.online ? 'text-green-600 font-bold' : 'text-gray-400'}>
                {u.online ? 'En ligne' : 'Hors ligne'}
              </span>
              {user?.role === 'Admin' && (
                <select
                  value={u.role}
                  onChange={e => handleRoleChange(u.id, e.target.value)}
                  className="rounded border-gray-300 text-xs"
                >
                  <option>Student</option>
                  <option>Professor</option>
                  <option>Admin</option>
                </select>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-gray-400 italic">Aucun utilisateur trouvé.</div>
        )}
      </div>
    </div>
  );
}


