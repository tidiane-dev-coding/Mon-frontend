// Page annonces — fil d'actualités et publications du département
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { api, baseURL } from '../../lib/api';

const DELEGATE_EMAILS = [
  'mariama1.diallo@univ-labe.edu.gn',
  'alpharahma2018@gmail.com',
  'dep.math@univ-labe.edu.gn',
];

function canManageAnnouncements(user: { role?: string; email?: string; isSuperAdmin?: boolean } | null): boolean {
  if (!user) return false;
  if (user.isSuperAdmin || user.role === 'Admin') return true;
  return DELEGATE_EMAILS.includes(String(user.email || '').trim().toLowerCase());
}

type Announcement = {
  _id?: string;
  title: string;
  content: string;
  date?: string;
  createdAt?: string;
  imageUrl?: string;
  pdfUrl?: string;
  pdfName?: string;
};

function mediaUrl(path: string | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${baseURL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

function formatDate(a: Announcement): string {
  const raw = a.createdAt || a.date;
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateShort(a: Announcement): string {
  const raw = a.createdAt || a.date;
  if (!raw) return '';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

// ——— Icônes ———
const MegaphoneIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-9 h-9 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const PdfIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const DotsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
  </svg>
);

// ——— Carte annonce ———
function AnnouncementCard({
  announcement: a,
  isAdmin,
  onEdit,
  onDelete,
}: {
  announcement: Announcement;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const hasMedia = !!(a.imageUrl || a.pdfUrl);

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      {a.imageUrl && (
        <div className="relative aspect-[21/9] sm:aspect-[2.5/1] overflow-hidden bg-slate-100">
          <img
            src={mediaUrl(a.imageUrl)}
            alt={a.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          <time className="absolute bottom-3 left-4 text-xs font-semibold text-white/95 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {formatDateShort(a)}
          </time>
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {!a.imageUrl && (
              <time className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                {formatDate(a)}
              </time>
            )}
            <h3 className="mt-1 text-lg sm:text-xl font-bold text-gray-900 leading-snug">{a.title}</h3>
          </div>
          {isAdmin && (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Options"
              >
                <DotsIcon />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 z-20 w-40 py-1 bg-white rounded-xl border border-gray-100 shadow-lg">
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                    onClick={() => { onEdit(); setMenuOpen(false); }}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                    onClick={() => { onDelete(); setMenuOpen(false); }}
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="mt-3 text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">{a.content}</p>

        {a.pdfUrl && (
          <a
            href={mediaUrl(a.pdfUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-800 transition-colors"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600">
              <PdfIcon />
            </span>
            <span className="truncate max-w-[200px] sm:max-w-xs">{a.pdfName || 'Document PDF'}</span>
            <span className="text-xs text-gray-400 ml-auto">Ouvrir →</span>
          </a>
        )}

        {!hasMedia && (
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400">
            <MegaphoneIcon className="w-4 h-4" />
            <span>Publication du département</span>
          </div>
        )}
      </div>
    </article>
  );
}

// ——— Zone upload ———
function FileDropZone({
  label,
  hint,
  accept,
  file,
  previewUrl,
  onFile,
  inputRef,
  tone,
}: {
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  previewUrl?: string | null;
  onFile: (f: File | null) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  tone: 'image' | 'pdf';
}) {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    onFile(e.dataTransfer.files[0] || null);
  };

  const borderTone = tone === 'image'
    ? dragOver ? 'border-violet-500 bg-violet-50' : file || previewUrl ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50/80'
    : dragOver ? 'border-violet-500 bg-violet-50' : file ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50/80';

  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-xl p-4 text-center transition-all ${borderTone}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
        {previewUrl && tone === 'image' ? (
          <img src={previewUrl} alt="Aperçu" className="mx-auto max-h-28 rounded-lg object-cover shadow-sm" />
        ) : file ? (
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">{tone === 'pdf' ? '📄' : '🖼️'}</span>
            <p className="text-sm font-medium text-gray-800 truncate max-w-full px-2">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} Ko — cliquer pour changer</p>
          </div>
        ) : (
          <>
            <UploadIcon />
            <p className="text-sm font-medium text-gray-700 mt-2">{hint}</p>
            <p className="text-xs text-gray-400 mt-1">Glisser-déposer ou cliquer — max. 10 Mo</p>
          </>
        )}
      </div>
    </div>
  );
}

export function AnnouncementsPage() {
  const { user } = useAuth();
  const canManage = canManageAnnouncements(user);
  const isDelegate = !!user && DELEGATE_EMAILS.includes(String(user.email || '').trim().toLowerCase());

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setImageFile(null);
    setPdfFile(null);
    setImagePreview(null);
    setEditIndex(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const pickImage = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { showToast('error', 'Format image requis (JPG, PNG, WebP…)'); return; }
    if (f.size > 10 * 1024 * 1024) { showToast('error', 'Image trop volumineuse (max. 10 Mo)'); return; }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const pickPdf = (f: File | null) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { showToast('error', 'Seuls les fichiers PDF sont acceptés'); return; }
    if (f.size > 10 * 1024 * 1024) { showToast('error', 'PDF trop volumineux (max. 10 Mo)'); return; }
    setPdfFile(f);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('content', content.trim());
    if (imageFile) fd.append('image', imageFile);
    if (pdfFile) fd.append('pdf', pdfFile);
    return fd;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      const fd = buildFormData();
      if (editIndex !== null) {
        const id = announcements[editIndex]?._id;
        if (id) {
          const res = await api.put(`/api/announcements/${id}`, fd);
          setAnnouncements((prev) => prev.map((a, i) => (i === editIndex ? res.data : a)));
          showToast('success', 'Annonce mise à jour.');
        }
      } else {
        const res = await api.post('/api/announcements', fd);
        setAnnouncements((prev) => [res.data, ...prev]);
        showToast('success', 'Annonce publiée avec succès.');
      }
      resetForm();
      setShowForm(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast('error', msg || 'Publication impossible. Accès réservé aux administrateurs et délégués.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/announcements');
        if (mounted) setAnnouncements(res.data);
      } catch {
        if (mounted) showToast('error', 'Impossible de charger les annonces.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleEdit = (idx: number) => {
    const a = announcements[idx];
    setTitle(a.title);
    setContent(a.content);
    setImageFile(null);
    setPdfFile(null);
    setImagePreview(a.imageUrl ? mediaUrl(a.imageUrl) : null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (pdfInputRef.current) pdfInputRef.current.value = '';
    setEditIndex(idx);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleDelete = (idx: number) => {
    if (!window.confirm('Supprimer définitivement cette annonce ?')) return;
    (async () => {
      try {
        const id = announcements[idx]?._id;
        if (id) await api.delete(`/api/announcements/${id}`);
        setAnnouncements((prev) => prev.filter((_, i) => i !== idx));
        if (editIndex === idx) { resetForm(); setShowForm(false); }
        showToast('success', 'Annonce supprimée.');
      } catch {
        showToast('error', 'Suppression impossible.');
      }
    })();
  };

  const withImage = announcements.filter((a) => a.imageUrl).length;
  const withPdf = announcements.filter((a) => a.pdfUrl).length;

  return (
    <div className="relative w-full bg-slate-50/80">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 max-w-sm px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
          role="alert"
        >
          {toast.msg}
        </div>
      )}

      {/* Hero */}
      <section
        className="relative min-h-[70vh] sm:min-h-[75vh] flex items-center justify-center overflow-hidden"
        style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}
        aria-label="Annonces"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1920&auto=format&fit=crop')",
            width: '100vw', left: '50%', transform: 'translateX(-50%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-indigo-950/75 to-violet-900/80" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-100 text-sm font-medium mb-6">
            <MegaphoneIcon className="w-4 h-4" />
            Département de Mathématiques
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Actualités &amp; Événements
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed">
            Conférences, rentrées, programmes — restez informé des annonces officielles du département.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15 min-w-[100px]">
              <p className="text-2xl font-bold text-white">{announcements.length}</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Annonces</p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15 min-w-[100px]">
              <p className="text-2xl font-bold text-white">{withImage}</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Avec visuel</p>
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/15 min-w-[100px]">
              <p className="text-2xl font-bold text-white">{withPdf}</p>
              <p className="text-xs text-white/70 uppercase tracking-wide">Documents</p>
            </div>
          </div>

          <a
            href="#content"
            className="inline-flex mt-10 items-center gap-2 px-8 py-3.5 bg-white text-indigo-900 font-semibold rounded-xl shadow-lg hover:bg-indigo-50 transition-colors"
          >
            Consulter le fil
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </a>
        </div>
      </section>

      {/* Contenu principal */}
      <section id="content" className="container-app py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Fil d'annonces */}
          <div className="flex-1 min-w-0">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Fil d&apos;actualités</h2>
                <p className="text-gray-500 text-sm mt-1">Les publications les plus récentes en premier</p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-xl mb-4" />
                    <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
                    <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-4/5" />
                  </div>
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 mb-4">
                  <MegaphoneIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Aucune annonce pour le moment</h3>
                <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                  Les événements et communications du département apparaîtront ici dès leur publication.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {announcements.map((a, i) => (
                  <AnnouncementCard
                    key={a._id || i}
                    announcement={a}
                    isAdmin={canManage}
                    onEdit={() => handleEdit(i)}
                    onDelete={() => handleDelete(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Panneau publication (admin + délégués) */}
          {canManage && (
            <aside className="lg:w-[380px] shrink-0">
              <div ref={formRef} className="lg:sticky lg:top-24">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" />
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">
                          {editIndex !== null ? 'Modifier l\'annonce' : 'Publier une annonce'}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {isDelegate && user?.role !== 'Admin' ? 'Espace délégué' : 'Administrateurs et délégués'}
                        </p>
                      </div>
                      {!showForm && editIndex === null && (
                        <button
                          type="button"
                          onClick={() => setShowForm(true)}
                          className="shrink-0 px-3 py-1.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                        >
                          + Nouveau
                        </button>
                      )}
                    </div>

                    {(showForm || editIndex !== null) ? (
                      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Titre</label>
                          <input
                            className="input"
                            placeholder="Ex. Conférence d'algèbre linéaire"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Description</label>
                          <textarea
                            className="input resize-y min-h-[100px]"
                            rows={4}
                            placeholder="Détails de l'événement, date, lieu..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                          />
                        </div>

                        <FileDropZone
                          label="Visuel événement"
                          hint="Affiche ou photo"
                          accept="image/*"
                          file={imageFile}
                          previewUrl={imagePreview}
                          onFile={pickImage}
                          inputRef={imageInputRef}
                          tone="image"
                        />

                        <FileDropZone
                          label="Document PDF"
                          hint="Programme, invitation..."
                          accept="application/pdf,.pdf"
                          file={pdfFile}
                          onFile={pickPdf}
                          inputRef={pdfInputRef}
                          tone="pdf"
                        />

                        {editIndex !== null && !pdfFile && announcements[editIndex]?.pdfUrl && (
                          <p className="text-xs text-gray-500 -mt-2">
                            PDF actuel conservé si aucun nouveau fichier n&apos;est choisi.
                          </p>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 pt-1">
                          <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-60 transition-all"
                          >
                            {submitting ? 'Envoi en cours…' : editIndex !== null ? 'Enregistrer' : 'Publier'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { resetForm(); setShowForm(false); }}
                            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50"
                          >
                            Annuler
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className="mt-4 text-sm text-gray-500 leading-relaxed">
                        Créez une annonce avec texte, image d&apos;événement et pièce jointe PDF pour informer tous les visiteurs du site.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          )}

          {!canManage && (
            <aside className="lg:w-[320px] shrink-0">
              <div className="lg:sticky lg:top-24 p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg">
                <MegaphoneIcon className="w-8 h-8 text-white/90" />
                <h3 className="mt-3 font-bold text-lg">Restez connecté</h3>
                <p className="mt-2 text-sm text-white/85 leading-relaxed">
                  Cette page centralise les communications officielles du département. Revenez régulièrement pour ne rien manquer.
                </p>
              </div>
            </aside>
          )}
        </div>
      </section>
    </div>
  );
}
