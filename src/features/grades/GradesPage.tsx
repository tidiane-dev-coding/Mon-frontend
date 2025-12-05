// Page des notes: saisie côté professeur et consultation/moyenne côté étudiant
import { useEffect, useState } from 'react';
import { LEVELS, SUBJECTS_30 } from '../../config/constants';
import { api } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext'

type Note = {
  student: string;
  value: number;
  classe: string;
  matiere: string;
  semestre: string;
  professeur: string;
};

export function GradesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ student: '', value: '', classe: LEVELS[0] + '-Math', matiere: SUBJECTS_30[0], semestre: 'Semestre 1', professeur: user?.name || '' });

  const moyenne = notes.length ? (notes.reduce((acc, n) => acc + n.value, 0) / notes.length).toFixed(2) : '-';

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(form.value);
    if (!form.student.trim() || isNaN(value) || value < 0 || value > 10 || !form.professeur.trim()) return;
    (async () => {
      try {
        setError(null); setSuccess(null);
        const res = await api.post('/api/grades', {
          student: form.student,
          value,
          classe: form.classe,
          matiere: form.matiere,
          semestre: form.semestre,
          professeur: form.professeur
        });
        // refresh from server to get canonical list
        const list = await api.get('/api/grades');
        setNotes(list.data);
        setSuccess('Note enregistrée');
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Erreur lors de l\'enregistrement';
        setError(msg);
      }
    })();
    setForm({ ...form, student: '', value: '', professeur: '' });
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/grades');
        if (mounted) { setNotes(res.data); setError(null); }
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Impossible de charger les notes';
        if (mounted) setError(msg);
      }
    })();
    return () => { mounted = false }
  }, [user])

  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm"
        aria-label="Notes"
      >
        <div
          className="h-[200px] w-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1600&q=80')" }}
        >
          <div className="h-full w-full bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
        </div>
        <div className="absolute inset-0 flex items-end p-6">
          <h1 className="text-2xl font-semibold text-white">Notes</h1>
        </div>
      </section>
      {/* Section principale: formulaire de saisie et zone de consultation */}
      <section className="card p-6">
        <h1 className="text-xl font-semibold text-primary-700">Notes</h1>
        <p className="text-gray-600 mt-2">Saisie par les professeurs, consultation et moyennes.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Formulaire de saisie des notes (réservé aux Professeurs et Admin) */}
          {user?.role !== 'Student' && (
            <form className="space-y-3" onSubmit={handleAddNote}>
            <h2 className="font-medium text-gray-800">Saisir des notes</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Classe</label>
              <select className="mt-1 w-full rounded border-gray-300" name="classe" value={form.classe} onChange={handleChange}>
                {LEVELS.map(l => <option key={l}>{l}-Math</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Matière</label>
              <select className="mt-1 w-full rounded border-gray-300" name="matiere" value={form.matiere} onChange={handleChange}>
                {SUBJECTS_30.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Semestre</label>
              <select className="mt-1 w-full rounded border-gray-300" name="semestre" value={form.semestre} onChange={handleChange}>
                <option>Semestre 1</option>
                <option>Semestre 2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Professeur</label>
              <input className="mt-1 w-full rounded border-gray-300" name="professeur" value={form.professeur} onChange={handleChange} placeholder="Nom du professeur" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded border-gray-300" name="student" value={form.student} onChange={handleChange} placeholder="Étudiant" />
              <input className="rounded border-gray-300" name="value" value={form.value} onChange={handleChange} type="number" step="0.01" placeholder="Note /10" max="10" min="0" />
            </div>
            <button type="submit" className="btn-primary">Enregistrer</button>
            </form>
          )}
          {/* Zone de consultation étudiant et moyenne calculée */}
          <div>
            <h2 className="font-medium text-gray-800">Consultation</h2>
            <div className="mt-2 text-sm text-gray-700">Moyenne calculée: {moyenne}</div>
            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
            {success && <div className="mt-2 text-sm text-green-600">{success}</div>}
            <ul className="mt-2 text-sm text-gray-700 list-disc pl-5">
              {notes.map((n, i) => (
                <li key={i} className="mb-3">
                  <div>
                    <span className="font-semibold">{n.student}</span> – Note : <span className="font-bold">{n.value}</span> /10
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="text-primary-700">Matière :</span> {n.matiere} | <span className="text-primary-700">Semestre :</span> {n.semestre} | <span className="text-primary-700">Professeur :</span> {n.professeur}
                  </div>
                  {user?.role === 'Admin' && (
                    <div className="mt-2 flex gap-2">
                      <button className="text-sm text-primary-600" onClick={async () => {
                        const newValue = prompt('Nouvelle note pour ' + n.student, String(n.value))
                        if (!newValue) return
                        const v = parseFloat(newValue)
                        if (isNaN(v) || v < 0 || v > 10) { alert('Valeur invalide'); return }
                        try {
                          const res = await api.put(`/api/grades/${(n as any)._id ?? i}`, { value: v })
                          setNotes(ns => ns.map((x, idx) => idx === i ? res.data : x))
                        } catch (err) { console.error(err); alert('Impossible de modifier') }
                      }}>Modifier</button>
                      <button className="text-sm text-red-600" onClick={async () => {
                        if (!confirm('Supprimer la note de ' + n.student + ' ?')) return
                        try {
                          await api.delete(`/api/grades/${(n as any)._id ?? i}`)
                          setNotes(ns => ns.filter((_, idx) => idx !== i))
                        } catch (err) { console.error(err); alert('Impossible de supprimer') }
                      }}>Supprimer</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}


