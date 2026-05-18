
import React, { useState } from 'react';

interface Cours {
  matiere: string;
  prof: string;
  salle: string;
  numero?: string;
}

// Icons
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const CheckIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const XIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

type SlotOption = { label: string; value: string };

interface ModalProps {
  onClose: () => void;
  onSave: (data: { _id?: string; day: string; slot: string; matiere?: string; prof?: string; salle?: string; numero?: string; slotType?: string; activity?: string }) => void;
  day: string | null;
  slot: string | null;
  days?: string[];
  slots?: SlotOption[];
  cours?: { _id?: string; matiere?: string; prof?: string; salle?: string; numero?: string; slotType?: string; activity?: string } | null;
}

export default function Modal({ onClose, onSave, day, slot, days = [], slots = [], cours }: ModalProps) {
  const [selectedDay, setSelectedDay] = useState(day || days[0] || '');
  const [selectedSlot, setSelectedSlot] = useState(slot || slots[0]?.value || '');
  const [slotType, setSlotType] = useState(cours?.slotType || 'cours');
  const [matiere, setMatiere] = useState(cours?.matiere || '');
  const [prof, setProf] = useState(cours?.prof || '');
  const [salle, setSalle] = useState(cours?.salle || '');
  const [numero, setNumero] = useState(cours?.numero || '');
  const [activity, setActivity] = useState(cours?.activity || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dayValue = day || selectedDay;
    const slotValue = slot || selectedSlot;
    if (!dayValue || !slotValue) {
      alert('Veuillez choisir le jour et le créneau horaire');
      return;
    }

    if (slotType === 'cours') {
      if (!matiere || !prof) {
        alert('Veuillez remplir les champs Matière et Professeur');
        return;
      }
      onSave({ _id: cours?._id, day: dayValue, slot: slotValue, matiere, prof, salle, numero, slotType });
    } else {
      if (!activity) {
        alert('Veuillez décrire l\'activité');
        return;
      }
      onSave({ _id: cours?._id, day: dayValue, slot: slotValue, activity, slotType });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{day || selectedDay || 'Nouveau créneau'}</h2>
            <p className="text-blue-100 text-sm mt-1">
              Créneau {slot || slots.find(s => s.value === selectedSlot)?.label || selectedSlot || ''}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {(!day || !slot) && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Jour *</label>
                <select
                  value={selectedDay}
                  onChange={e => setSelectedDay(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none font-medium"
                  required
                >
                  {days.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Horaire *</label>
                <select
                  value={selectedSlot}
                  onChange={e => setSelectedSlot(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none font-medium"
                  required
                >
                  {slots.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Type Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">Type de créneau</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                slotType === 'cours'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="slotType"
                  value="cours"
                  checked={slotType === 'cours'}
                  onChange={e => setSlotType(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="font-semibold text-gray-900">Cours</span>
              </label>
              <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                slotType === 'activity'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="slotType"
                  value="activity"
                  checked={slotType === 'activity'}
                  onChange={e => setSlotType(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="font-semibold text-gray-900">Activité</span>
              </label>
            </div>
          </div>

          {/* Cours Fields */}
          {slotType === 'cours' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Matière *</label>
                <input 
                  type="text" 
                  value={matiere} 
                  onChange={e => setMatiere(e.target.value)} 
                  placeholder="Ex: Analyse 2"
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Professeur *</label>
                <input 
                  type="text" 
                  value={prof} 
                  onChange={e => setProf(e.target.value)} 
                  placeholder="Ex: Dr Camara"
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Salle</label>
                <input 
                  type="text" 
                  value={salle} 
                  onChange={e => setSalle(e.target.value)} 
                  placeholder="Ex: Amphi A1"
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Téléphone Professeur</label>
                <input 
                  type="text" 
                  value={numero} 
                  onChange={e => setNumero(e.target.value)} 
                  placeholder="Ex: +224 620 00 00 00"
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                />
              </div>
            </div>
          )}

          {/* Activity Field */}
          {slotType === 'activity' && (
            <div>
              <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Description de l'activité *</label>
              <textarea 
                value={activity} 
                onChange={e => setActivity(e.target.value)} 
                placeholder="Ex: Recherche personnelle à la bibliothèque"
                className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none transition-colors font-medium resize-none h-24"
                required
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-colors"
            >
              <XIcon />
              Annuler
            </button>
            <button 
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              <CheckIcon />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
