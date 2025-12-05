// Page emploi du temps: visualisation par jour et créneaux, édition rapide
import { DAYS_FR } from '../../config/constants'

import { useEffect, useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../lib/api';



interface Cours {
  matiere: string;
  prof: string;
  salle: string;
  numero?: string;
}

interface SlotDoc extends Cours {
  _id?: string;
}

// Créneaux de 2h : 9h-11h, 11h-13h, 14h-17h
const SLOTS_2H = [
  { label: '09:00 - 11:00', value: '09-11' },
  { label: '11:00 - 13:00', value: '11-13' },
  { label: '14:00 - 17:00', value: '14-17' },
];

type ScheduleType = {
  [day: string]: {
    [slot: string]: SlotDoc;
  };
};

export function SchedulePage() {
  const { user } = useAuth();
  // selected classe (e.g. L1, L2, L3, Master). Default to user's classe if available
  const [classe, setClasse] = useState<string>(user?.classe || 'L1');
  // État de la modale et du créneau sélectionné
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: string | null; slot: string | null }>({ day: null, slot: null });
  // Emploi du temps: { [jour]: { [heure]: { matiere, prof, salle } } }
  const [schedule, setSchedule] = useState<ScheduleType>({});

  // Ouvre la modale pour un créneau précis
  const handleSlotClick = (day: string, slot: string) => {
    setSelectedSlot({ day, slot });
    setShowModal(true);
  };

  // Ajoute ou modifie un cours dans l'emploi du temps
  const handleSave = (data: { day: string; slot: string; matiere: string; prof: string; salle: string; numero?: string }) => {
    (async () => {
      // Persist the slot
      const res = await api.post('/api/schedule', { day: data.day, slot: data.slot, matiere: data.matiere, prof: data.prof, salle: data.salle, numero: data.numero, classe });
      // reload schedule list
      const all = await api.get(`/api/schedule?classe=${encodeURIComponent(classe)}`);
      const structured: ScheduleType = {} as any;
      all.data.forEach((s: any) => {
        (structured[s.day] = structured[s.day] || {})[s.slot] = { _id: s._id, matiere: s.matiere, prof: s.prof, salle: s.salle, numero: s.numero };
      });
      setSchedule(structured);
    })();
    setShowModal(false);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get(`/api/schedule?classe=${encodeURIComponent(classe)}`);
        if (!mounted) return
        const structured: ScheduleType = {} as any;
        res.data.forEach((s: any) => {
          (structured[s.day] = structured[s.day] || {})[s.slot] = { _id: s._id, matiere: s.matiere, prof: s.prof, salle: s.salle, numero: s.numero };
        });
        setSchedule(structured);
      } catch (err) {}
    })();
    return () => { mounted = false }
  }, [classe])

  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm"
        aria-label="Emploi du temps"
      >
        <div
          className="h-[200px] w-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1600&auto=format&fit=crop')" }}
        >
          <div className="h-full w-full bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
        </div>
        <div className="absolute inset-0 flex items-end p-6">
          <h1 className="text-2xl font-semibold text-white">Emploi du temps</h1>
        </div>
      </section>
      {/* Section principale: grille hebdomadaire et action d'édition rapide */}
      <section className="card p-6">
        <h1 className="text-xl font-semibold text-primary-700">Emploi du temps</h1>
        <p className="text-gray-600 mt-2">Visualisation par classe et par jour, édition rapide.</p>
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium">Classe / Niveau :</label>
            <select className="input input-bordered" value={classe} onChange={e => setClasse(e.target.value)}>
              <option value="L1">L1</option>
              <option value="L2">L2</option>
              <option value="L3">L3</option>
              <option value="Master">Master</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 text-sm">
            {DAYS_FR.map(day => (
              <div key={day} className="rounded border border-gray-200 bg-white">
                <div className="px-3 py-2 font-medium bg-gray-50 border-b">{day}</div>
                <div className="p-3 space-y-2">
                  {SLOTS_2H.map(slot => {
                    const cours = schedule[day]?.[slot.value];
                    return (
                      <div
                        key={slot.value}
                        className={`rounded border px-2 py-1 flex flex-col gap-1 cursor-pointer ${user?.role === 'Admin' ? 'hover:bg-primary-50' : ''}`}
                        onClick={user?.role === 'Admin' ? () => handleSlotClick(day, slot.value) : undefined}
                        style={{ cursor: user?.role === 'Admin' ? 'pointer' : 'default' }}
                      >
                        <span className="font-medium text-gray-700">{slot.label}</span>
                        {cours ? (
                          <div className="text-xs text-gray-700 space-y-1">
                            <div><span className="font-semibold">Matière :</span> {cours.matiere}</div>
                            <div><span className="font-semibold">Salle :</span> {cours.salle}</div>
                            <div><span className="font-semibold">Professeur :</span> {cours.prof}</div>
                            {cours.numero && (
                              <div><span className="font-semibold">Numéro :</span> {cours.numero}</div>
                            )}
                            {user?.role === 'Admin' && (
                              <div className="flex gap-2 mt-2">
                                <button className="text-sm text-primary-600" onClick={() => { setSelectedSlot({ day, slot: slot.value }); setShowModal(true); }}>Modifier</button>
                                {cours._id && <button className="text-sm text-red-600" onClick={async () => {
                                  await api.delete(`/api/schedule/${cours._id}`);
                                  // refresh
                                  const all = await api.get('/api/schedule');
                                  const structured: ScheduleType = {} as any;
                                  all.data.forEach((s: any) => {
                                    (structured[s.day] = structured[s.day] || {})[s.slot] = { _id: s._id, matiere: s.matiere, prof: s.prof, salle: s.salle, numero: s.numero };
                                  });
                                  setSchedule(structured);
                                }}>Supprimer</button>}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Bouton d'ajout/modification réservé à l'admin */}
        {user?.role === 'Admin' && (
          <div className="mt-3">
            <button className="btn-primary" onClick={() => setShowModal(true)}>Ajouter/Modifier (modale)</button>
          </div>
        )}
      </section>
      {/* Modale d'édition rapide réservée à l'admin */}
      {user?.role === 'Admin' && showModal && selectedSlot.day && selectedSlot.slot && (
        <Modal
          onClose={() => setShowModal(false)}
          onSave={(data) => handleSave({ ...data, slot: selectedSlot.slot! })}
          day={selectedSlot.day}
          slot={selectedSlot.slot}
          cours={schedule[selectedSlot.day]?.[selectedSlot.slot] || null}
        />
      )}
    </div>
  );
}
