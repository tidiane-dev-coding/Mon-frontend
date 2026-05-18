// Page emploi du temps: visualisation par jour et créneaux, édition rapide
import React from 'react'
import { DAYS_FR } from '../../config/constants'

import { useEffect, useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../lib/api';

// Icons
const BookOpenIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.996 10-10.747S17.5 6.253 12 6.253z" /></svg>;
const ClockIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const MapPinIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const EditIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const LightBulbIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5.36 4.24l-.707.707M9 12a3 3 0 11 6 0 3 3 0 01-6 0z" /></svg>;

interface Cours {
  matiere: string;
  prof: string;
  salle: string;
  numero?: string;
}

interface SlotDoc extends Cours {
  _id?: string;
  slotType?: string;
  activity?: string;
}

// Créneaux journaliers : 9h-13h et 14h-17h
const SLOTS_2H = [
  { label: '09:00 - 13:00', value: '09-13' },
  { label: '14:00 - 17:00', value: '14-17' },
];

// Anciens créneaux en base (ex. 09-11) → clés affichées dans la grille
const SLOT_ALIASES: Record<string, string> = {
  '09-11': '09-13',
  '11-13': '09-13',
  '14-16': '14-17',
  '16-17': '14-17',
};

type ScheduleType = {
  [day: string]: {
    [slot: string]: SlotDoc;
  };
};

export function SchedulePage() {
  const { user } = useAuth();
  const delegatedEmails = ['mariama1.diallo@univ-labe.edu.gn', 'alpharahma2018@gmail.com', 'dep.math@univ-labe.edu.gn'];
  const canManageSchedule =
    user?.role === 'Admin' ||
    user?.role === 'Professor' ||
    user?.isSuperAdmin === true ||
    delegatedEmails.includes(String(user?.email || '').toLowerCase());
  // selected classe (e.g. L1, L2, L3, Master). Default to user's classe if available
  const [classe, setClasse] = useState<string>('L1');
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

  const loadSchedule = async () => {
    const all = await api.get(`/api/schedule?classe=${encodeURIComponent(classe)}`);
    const structured: ScheduleType = {} as ScheduleType;
    all.data.forEach((s: { day: string; slot: string; _id?: string; matiere?: string; prof?: string; salle?: string; numero?: string; slotType?: string; activity?: string }) => {
      const slotKey = SLOT_ALIASES[s.slot] || s.slot;
      (structured[s.day] = structured[s.day] || {})[slotKey] = {
        _id: s._id,
        matiere: s.matiere ?? '',
        prof: s.prof ?? '',
        salle: s.salle ?? '',
        numero: s.numero,
        slotType: s.slotType || 'cours',
        activity: s.activity,
      };
    });
    setSchedule(structured);
  };

  // Ajoute ou modifie un cours dans l'emploi du temps
  const handleSave = async (data: { _id?: string; day: string; slot: string; matiere?: string; prof?: string; salle?: string; numero?: string; slotType?: string; activity?: string }) => {
    const payload = {
      day: data.day,
      slot: data.slot,
      matiere: data.matiere,
      prof: data.prof,
      salle: data.salle,
      numero: data.numero,
      slotType: data.slotType,
      activity: data.activity,
      classe,
    };
    try {
      if (data._id) {
        await api.put(`/api/schedule/${data._id}`, payload);
      } else {
        await api.post('/api/schedule', payload);
      }
      await loadSchedule();
      setShowModal(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      alert(
        msg === 'Forbidden'
          ? 'Accès refusé (403). Connectez-vous avec un compte Admin ou Professeur, puis réessayez. Si le problème continue, le serveur Render doit être mis à jour.'
          : msg || 'Impossible d\'enregistrer ce créneau. Vérifiez vos droits et votre connexion.'
      );
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadSchedule();
        if (!mounted) return;
      } catch {
        if (mounted) setSchedule({});
      }
    })();
    return () => { mounted = false };
  }, [classe]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header Professionnel */}
      <section className="relative overflow-hidden rounded-xl shadow-lg">
        <div
          className="h-64 w-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000&auto=format&fit=crop')" }}
        >
          <div className="h-full w-full bg-gradient-to-b from-blue-900/40 via-blue-800/50 to-blue-900/70" />
        </div>
        <div className="absolute inset-0 flex flex-col justify-end p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 backdrop-blur rounded-lg">
              <BookOpenIcon />
            </div>
            <h1 className="text-4xl font-bold text-white">Emploi du Temps</h1>
          </div>
          <p className="text-blue-100 text-lg">Visualisation et gestion de votre planning académique</p>
        </div>
      </section>

      {/* Main Content */}
      <div className="px-0 md:px-0">
        {/* Controls Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Sélectionner le niveau</label>
              <select 
                className="px-4 py-2.5 rounded-lg border-2 border-gray-200 bg-white font-medium text-gray-700 hover:border-blue-400 focus:border-blue-500 focus:outline-none transition-colors"
                value={classe} 
                onChange={e => setClasse(e.target.value)}
              >
                <option value="L1">Licence 1</option>
                <option value="L2">Licence 2</option>
                <option value="L3">Licence 3</option>
                <option value="Master">Master</option>
              </select>
            </div>
            {canManageSchedule && (
              <button 
                onClick={() => { setSelectedSlot({ day: null, slot: null }); setShowModal(true); }}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                <PlusIcon />
                Ajouter un créneau
              </button>
            )}
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {DAYS_FR.map(day => (
            <div key={day} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
              {/* Day Header */}
              <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                <h3 className="text-lg font-bold text-blue-900">{day}</h3>
              </div>

              {/* Time Slots */}
              <div className="p-4 space-y-4 min-h-96">
                {SLOTS_2H.map(slot => {
                  const cours = schedule[day]?.[slot.value];
                  const isEmpty = !cours;
                  
                  return (
                    <div
                      key={slot.value}
                      onClick={canManageSchedule && isEmpty ? () => handleSlotClick(day, slot.value) : undefined}
                      className={`rounded-lg border-2 p-4 transition-all ${
                        isEmpty
                          ? canManageSchedule
                            ? 'border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                            : 'border-solid border-gray-200 bg-gray-50'
                          : cours.slotType === 'activity'
                          ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50'
                          : 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50'
                      }`}
                    >
                      {/* Time Label */}
                      <div className="flex items-center gap-2 mb-3">
                        <ClockIcon />
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{slot.label}</span>
                      </div>

                      {isEmpty ? (
                        <div className="flex items-center justify-center py-6">
                          <p className="text-gray-400 text-xs text-center">
                            {canManageSchedule ? '+ Cliquez pour ajouter' : '—'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {/* Cours */}
                          {cours.slotType === 'cours' && (
                            <>
                              {/* Matière */}
                              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-3 text-white">
                                <p className="text-xs font-bold uppercase tracking-widest opacity-90">Matière</p>
                                <p className="text-base font-bold mt-1">{cours.matiere}</p>
                              </div>

                              {/* Professeur */}
                              {cours.prof && (
                                <div className="flex items-start gap-2 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg p-3 border-l-4 border-purple-400">
                                  <UserIcon />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">Professeur</p>
                                    <p className="text-sm font-bold text-purple-900">{cours.prof}</p>
                                  </div>
                                </div>
                              )}

                              {/* Salle */}
                              {cours.salle && (
                                <div className="flex items-start gap-2 bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-3 border-l-4 border-green-400">
                                  <MapPinIcon />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Salle</p>
                                    <p className="text-sm font-bold text-green-900">{cours.salle}</p>
                                  </div>
                                </div>
                              )}

                              {/* Numéro */}
                              {cours.numero && (
                                <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg p-2.5 border-l-4 border-orange-400">
                                  <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">Téléphone</p>
                                  <p className="text-sm font-bold text-orange-900">📞 {cours.numero}</p>
                                </div>
                              )}
                            </>
                          )}

                          {/* Activité Libre */}
                          {cours.slotType === 'activity' && (
                            <div className="bg-gradient-to-br from-amber-200 to-amber-100 rounded-lg p-3 border-l-4 border-amber-500">
                              <div className="flex items-start gap-2">
                                <LightBulbIcon />
                                <div className="flex-1">
                                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Activité</p>
                                  <p className="text-sm font-bold text-amber-900 mt-1">{cours.activity}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {canManageSchedule && (
                            <div className="flex gap-2 pt-3 border-t border-gray-300">
                              <button
                                onClick={() => { setSelectedSlot({ day, slot: slot.value }); setShowModal(true); }}
                                className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded transition-colors"
                              >
                                <EditIcon />
                                Modifier
                              </button>
                              {cours._id && (
                                <button
                                  onClick={async () => {
                                    await api.delete(`/api/schedule/${cours._id}`);
                                    await loadSchedule();
                                  }}
                                  className="px-2 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded transition-colors"
                                >
                                  <TrashIcon />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modale d'édition / ajout */}
      {canManageSchedule && showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          onSave={(data) => handleSave(data)}
          day={selectedSlot.day}
          slot={selectedSlot.slot}
          days={DAYS_FR}
          slots={SLOTS_2H}
          cours={
            selectedSlot.day && selectedSlot.slot
              ? schedule[selectedSlot.day]?.[selectedSlot.slot] || null
              : null
          }
        />
      )}
    </div>
  );
}
