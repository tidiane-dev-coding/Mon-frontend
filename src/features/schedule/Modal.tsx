
import React, { useState } from 'react';

interface Cours {
  matiere: string;
  prof: string;
  salle: string;
  numero?: string;
}


interface ModalProps {
  onClose: () => void;
  onSave: (data: { day: string; slot: string; matiere: string; prof: string; salle: string; numero?: string }) => void;
  day: string;
  slot: string;
  cours?: { matiere?: string; prof?: string; salle?: string; numero?: string } | null;
}

export default function Modal({ onClose, onSave, day, slot, cours }: ModalProps) {
  const [matiere, setMatiere] = useState(cours?.matiere || '');
  const [prof, setProf] = useState(cours?.prof || '');
  const [salle, setSalle] = useState(cours?.salle || '');
  const [numero, setNumero] = useState(cours?.numero || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ day, slot, matiere, prof, salle, numero });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-semibold mb-4">{day} – {slot}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Matière</label>
            <input type="text" className="input input-bordered w-full" value={matiere} onChange={e => setMatiere(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Professeur</label>
            <input type="text" className="input input-bordered w-full" value={prof} onChange={e => setProf(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium">Salle</label>
            <input type="text" className="input input-bordered w-full" value={salle} onChange={e => setSalle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Numéro du professeur</label>
            <input type="text" className="input input-bordered w-full" value={numero} onChange={e => setNumero(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
}
