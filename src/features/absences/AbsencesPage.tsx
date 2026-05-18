import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { api, baseURL } from '../../lib/api';

const DELEGATE_EMAILS = [
  'mariama1.diallo@univ-labe.edu.gn',
  'alpharahma2018@gmail.com',
  'dep.math@univ-labe.edu.gn',
];

type RequestType = 'conge' | 'absence' | 'lettre';
type Addressee = 'chef_departement' | 'recteur';
type Status = 'pending' | 'approved' | 'rejected';
type Filter = 'all' | Status;

type AbsenceRequest = {
  _id: string;
  studentName: string;
  studentEmail: string;
  classe?: string;
  requestType: RequestType;
  addressee: Addressee;
  subject: string;
  message: string;
  startDate?: string;
  endDate?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: Status;
  reviewNote?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  createdAt: string;
};

const TYPE_OPTIONS: { value: RequestType; label: string; desc: string; icon: string }[] = [
  { value: 'absence', label: "Message d'absence", desc: 'Justifier une absence ponctuelle', icon: '📋' },
  { value: 'conge', label: 'Demande de congé', desc: 'Absence sur plusieurs jours', icon: '📅' },
  { value: 'lettre', label: 'Lettre formelle', desc: 'Courrier officiel au département ou recteur', icon: '✉️' },
];

const ADDRESSEE_OPTIONS: { value: Addressee; label: string; subtitle: string }[] = [
  { value: 'chef_departement', label: 'Chef du département', subtitle: 'Département de Mathématiques' },
  { value: 'recteur', label: 'Recteur', subtitle: 'Université de Labé' },
];

const LETTER_TEMPLATE = `Monsieur/Madame [Destinataire],

Je soussigné(e) [Votre nom], étudiant(e) en [niveau], vous prie de bien vouloir accepter ma demande d'absence pour le motif suivant :

[Motif détaillé]

Période concernée : du [date début] au [date fin].

Je reste à votre disposition pour tout complément d'information.

Veuillez agréer, Monsieur/Madame, l'expression de ma considération distinguée.

[Votre nom]
[Niveau / Matricule]`;

function attachmentHref(url: string) {
  if (url.startsWith('http')) return url;
  return `${baseURL.replace(/\/+$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
}

function formatDate(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// Icons
const DocIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

function StatusBadge({ status }: { status: Status }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-800 ring-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    rejected: 'bg-rose-100 text-rose-800 ring-rose-200',
  };
  const labels = { pending: 'En attente', approved: 'Acceptée', rejected: 'Refusée' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full ring-1 ${styles[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'pending' ? 'bg-amber-500 animate-pulse' : status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      {labels[status]}
    </span>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: 'amber' | 'emerald' | 'rose' | 'slate' }) {
  const tones = {
    amber: 'from-amber-500 to-orange-500',
    emerald: 'from-emerald-500 to-teal-600',
    rose: 'from-rose-500 to-pink-600',
    slate: 'from-slate-600 to-slate-800',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${tones[tone]}`} />
      <div className="p-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function RequestCard({
  request: r,
  canReview,
  expanded,
  onToggle,
  reviewNote,
  onReviewNote,
  onReview,
  reviewing,
}: {
  request: AbsenceRequest;
  canReview: boolean;
  expanded: boolean;
  onToggle: () => void;
  reviewNote: string;
  onReviewNote: (v: string) => void;
  onReview: (status: 'approved' | 'rejected') => void;
  reviewing: boolean;
}) {
  const typeMeta = TYPE_OPTIONS.find((t) => t.value === r.requestType);
  const addresseeMeta = ADDRESSEE_OPTIONS.find((a) => a.value === r.addressee);

  return (
    <article className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-5 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
            {initials(r.studentName)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-gray-900 truncate">{r.subject}</h3>
            <p className="text-sm text-gray-500 truncate">
              {r.studentName}
              {r.classe ? ` · ${r.classe}` : ''}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(r.createdAt).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusBadge status={r.status} />
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap gap-2 py-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
              {typeMeta?.icon} {typeMeta?.label}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
              → {addresseeMeta?.label}
            </span>
            {r.startDate && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
                📆 {formatDate(r.startDate)}
                {r.endDate ? ` — ${formatDate(r.endDate)}` : ''}
              </span>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{r.message}</p>
          </div>

          <p className="text-xs text-gray-500 mb-3">{r.studentEmail}</p>

          {r.attachmentUrl && (
            <a
              href={attachmentHref(r.attachmentUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg mb-4 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <DocIcon className="w-4 h-4" />
              {r.attachmentName || 'Voir la pièce jointe'}
            </a>
          )}

          {r.reviewedByName && (
            <div className={`rounded-lg p-3 text-sm mb-4 ${r.status === 'approved' ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' : 'bg-rose-50 text-rose-900 border border-rose-100'}`}>
              <p className="font-semibold">Réponse du délégué</p>
              <p className="mt-1 opacity-90">
                {r.reviewedByName}
                {r.reviewNote ? ` — « ${r.reviewNote} »` : ''}
              </p>
            </div>
          )}

          {canReview && r.status === 'pending' && (
            <div className="pt-4 border-t border-gray-200 space-y-3" onClick={(e) => e.stopPropagation()}>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                Commentaire pour l&apos;étudiant (optionnel)
              </label>
              <textarea
                value={reviewNote}
                onChange={(e) => onReviewNote(e.target.value)}
                placeholder="Ex : Demande acceptée, merci de fournir le certificat médical à l'administration."
                rows={2}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none resize-none"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => onReview('approved')}
                  className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  ✓ Accepter
                </button>
                <button
                  type="button"
                  disabled={reviewing}
                  onClick={() => {
                    if (window.confirm('Confirmer le refus de cette demande ?')) onReview('rejected');
                  }}
                  className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-rose-300 text-rose-700 hover:bg-rose-50 font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  ✕ Refuser
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export function AbsencesPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isStudent = user?.role === 'Student';
  const canReview =
    user?.role === 'Admin' ||
    user?.isSuperAdmin === true ||
    DELEGATE_EMAILS.includes(String(user?.email || '').toLowerCase());

  const [requests, setRequests] = useState<AbsenceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(true);
  const [dragOver, setDragOver] = useState(false);

  const [requestType, setRequestType] = useState<RequestType>('absence');
  const [addressee, setAddressee] = useState<Addressee>('chef_departement');
  const [classe, setClasse] = useState('L1');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get<AbsenceRequest[]>('/api/absences');
      setRequests(res.data);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const stats = useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    }),
    [requests]
  );

  const filtered = useMemo(() => {
    let list = filter === 'all' ? requests : requests.filter((r) => r.status === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.subject.toLowerCase().includes(q) ||
          r.studentName.toLowerCase().includes(q) ||
          r.studentEmail.toLowerCase().includes(q) ||
          (r.classe || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [requests, filter, search]);

  const applyLetterTemplate = () => {
    setRequestType('lettre');
    const dest = addressee === 'recteur' ? 'Recteur' : 'Chef du département de Mathématiques';
    setMessage(
      LETTER_TEMPLATE.replace('[Destinataire]', dest)
        .replace('[Votre nom]', user?.name || '…………')
        .replace('[niveau]', classe)
    );
    if (!subject.trim()) setSubject(`Demande d'absence — ${classe}`);
  };

  const handleFile = (f: File | null) => {
    if (!f) return;
    const max = 10 * 1024 * 1024;
    if (f.size > max) {
      showToast('error', 'Fichier trop volumineux (max. 10 Mo).');
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('requestType', requestType);
      fd.append('addressee', addressee);
      fd.append('classe', classe);
      fd.append('subject', subject.trim());
      fd.append('message', message.trim());
      if (startDate) fd.append('startDate', startDate);
      if (endDate) fd.append('endDate', endDate);
      if (file) fd.append('file', file);

      await api.post('/api/absences', fd);
      setSubject('');
      setMessage('');
      setStartDate('');
      setEndDate('');
      setFile(null);
      setShowForm(false);
      await loadRequests();
      showToast('success', 'Demande envoyée. Les délégués seront notifiés et traiteront votre dossier.');
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showToast('error', msg || "Impossible d'envoyer la demande.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    setReviewingId(id);
    try {
      await api.patch(`/api/absences/${id}`, { status, reviewNote: reviewNotes[id] || '' });
      await loadRequests();
      setExpandedId(null);
      showToast('success', status === 'approved' ? 'Demande acceptée.' : 'Demande refusée.');
    } catch {
      showToast('error', 'Impossible de mettre à jour cette demande.');
    } finally {
      setReviewingId(null);
    }
  };

  const filterPills: { key: Filter; label: string; count?: number }[] = canReview
    ? [
        { key: 'all', label: 'Toutes', count: stats.all },
        { key: 'pending', label: 'En attente', count: stats.pending },
        { key: 'approved', label: 'Acceptées', count: stats.approved },
        { key: 'rejected', label: 'Refusées', count: stats.rejected },
      ]
    : [
        { key: 'all', label: 'Toutes' },
        { key: 'pending', label: 'En attente' },
        { key: 'approved', label: 'Acceptées' },
        { key: 'rejected', label: 'Refusées' },
      ];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 max-w-sm px-5 py-4 rounded-xl shadow-2xl border text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
          role="alert"
        >
          {toast.text}
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl shadow-xl">
        <div
          className="h-56 md:h-64 w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2000&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/85 via-violet-900/75 to-slate-900/90" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-white/15 backdrop-blur-md rounded-xl border border-white/20 shadow-lg">
              <DocIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Demandes d&apos;absence
              </h1>
              <p className="text-indigo-100 mt-2 max-w-2xl text-base md:text-lg">
                Congés, justificatifs et lettres officielles — traitement par les délégués de classe
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {(canReview || isStudent) && !loading && requests.length > 0 && (
        <div className={`grid gap-4 ${canReview ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-3'}`}>
          {canReview && <StatCard label="Total" value={stats.all} tone="slate" />}
          <StatCard label="En attente" value={stats.pending} tone="amber" />
          <StatCard label="Acceptées" value={stats.approved} tone="emerald" />
          <StatCard label="Refusées" value={stats.rejected} tone="rose" />
        </div>
      )}

      <div className={`grid gap-6 ${isStudent ? 'xl:grid-cols-5' : ''}`}>
        {/* Formulaire étudiant */}
        {isStudent && (
          <div className={`xl:col-span-2 space-y-4 ${!showForm && 'xl:col-span-1'}`}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Nouvelle demande</h2>
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {showForm ? 'Réduire' : '+ Nouvelle demande'}
              </button>
            </div>

            {showForm && (
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
              >
                <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
                <div className="p-6 space-y-6">
                  {/* Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                      Type de demande
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {TYPE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRequestType(opt.value)}
                          className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                            requestType === opt.value
                              ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20'
                              : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                          }`}
                        >
                          <span className="text-2xl">{opt.icon}</span>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{opt.label}</p>
                            <p className="text-xs text-gray-500">{opt.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    {requestType === 'lettre' && (
                      <button
                        type="button"
                        onClick={applyLetterTemplate}
                        className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        Insérer un modèle de lettre
                      </button>
                    )}
                  </div>

                  {/* Destinataire */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                      Destinataire
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ADDRESSEE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setAddressee(opt.value)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            addressee === opt.value
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className="font-bold text-sm text-gray-900">{opt.label}</p>
                          <p className="text-xs text-gray-500">{opt.subtitle}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Niveau
                    </label>
                    <select
                      value={classe}
                      onChange={(e) => setClasse(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl font-medium focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="L1">Licence 1</option>
                      <option value="L2">Licence 2</option>
                      <option value="L3">Licence 3</option>
                      <option value="Master">Master</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Début
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Fin
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Objet *
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Ex : Absence pour raison médicale"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Message / lettre *
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Décrivez le motif de votre demande..."
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-y min-h-[120px]"
                      required
                    />
                  </div>

                  {/* Upload zone */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Pièce jointe
                    </label>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        handleFile(e.dataTransfer.files[0] || null);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                        dragOver
                          ? 'border-indigo-500 bg-indigo-50'
                          : file
                          ? 'border-emerald-400 bg-emerald-50/50'
                          : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0] || null)}
                      />
                      {file ? (
                        <div>
                          <p className="font-semibold text-emerald-800 text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(file.size / 1024).toFixed(0)} Ko — cliquer pour changer
                          </p>
                        </div>
                      ) : (
                        <>
                          <UploadIcon />
                          <p className="text-sm font-medium text-gray-700 mt-2">
                            Glissez un fichier ou cliquez ici
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PDF, Word ou image — max. 10 Mo</p>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60"
                  >
                    {submitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Liste */}
        <div className={isStudent ? 'xl:col-span-3' : ''}>
          {!isStudent && !canReview && (
            <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-5 flex gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="font-semibold text-amber-900">Consultation uniquement</p>
                <p className="text-sm text-amber-800 mt-1">
                  Seuls les étudiants peuvent déposer une demande. Les délégués et administrateurs la traitent.
                </p>
              </div>
            </div>
          )}

          {canReview && (
            <div className="mb-4 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-indigo-900">
              <strong>Espace délégué</strong> — Vous pouvez accepter ou refuser les demandes des étudiants.
            </div>
          )}

          <section className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="p-5 md:p-6 border-b border-gray-100 bg-gray-50/80">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {canReview ? 'Demandes reçues' : 'Mes demandes'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {loading ? '…' : `${filtered.length} demande${filtered.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
                {(canReview || requests.length > 3) && (
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher par nom, objet, niveau…"
                    className="w-full lg:w-72 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:border-indigo-500 focus:outline-none"
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {filterPills.map((pill) => (
                  <button
                    key={pill.key}
                    type="button"
                    onClick={() => setFilter(pill.key)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      filter === pill.key
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'
                    }`}
                  >
                    {pill.label}
                    {pill.count !== undefined && (
                      <span className={`ml-1.5 ${filter === pill.key ? 'text-indigo-200' : 'text-gray-400'}`}>
                        ({pill.count})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 md:p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 text-3xl mb-4">
                    📭
                  </div>
                  <p className="font-semibold text-gray-900">Aucune demande</p>
                  <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                    {isStudent
                      ? 'Soumettez votre première demande via le formulaire à gauche.'
                      : filter !== 'all'
                      ? 'Aucune demande dans cette catégorie.'
                      : 'Les demandes des étudiants apparaîtront ici.'}
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {filtered.map((r) => (
                    <li key={r._id}>
                      <RequestCard
                        request={r}
                        canReview={canReview}
                        expanded={expandedId === r._id}
                        onToggle={() => setExpandedId(expandedId === r._id ? null : r._id)}
                        reviewNote={reviewNotes[r._id] || ''}
                        onReviewNote={(v) => setReviewNotes((prev) => ({ ...prev, [r._id]: v }))}
                        onReview={(status) => handleReview(r._id, status)}
                        reviewing={reviewingId === r._id}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
