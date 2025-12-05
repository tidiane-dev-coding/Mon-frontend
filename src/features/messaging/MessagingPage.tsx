// Page messagerie: chat en temps réel (Socket.IO)

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../../auth/AuthContext'
import { api } from '../../lib/api'



export function MessagingPage() {
  const { user, token } = useAuth();
  type Msg = { _id?: string; text: string; sender: string; group: string; createdAt?: string }
  const [messages, setMessages] = useState<Msg[]>([]);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [group, setGroup] = useState('Général');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
  const socketUrl = ((import.meta as any).env?.VITE_SOCKET_URL as string) || 'http://localhost:5000';
    const socket = io(socketUrl, { autoConnect: false });

    setStatus('connecting');
    // load persisted messages first using axios (will include Authorization header if present)
    (async () => {
      try {
        const res = await api.get<Msg[]>('/api/messages');
        setMessages(res.data || []);
        setLoadError(null);
        setStatus('connected');
      } catch (err: any) {
        console.error('Failed to load messages', err);
        if ((err as any)?.response?.status === 401) {
          setLoadError('unauthenticated');
        } else {
          setLoadError('failed');
        }
        setStatus('disconnected');
      }
    })();

    socket.connect();
    socket.on('connect', () => {
      setMessages(m => [...m, { text: 'Connecté au chat', sender: 'Système', group: 'Général', _id: 'sys-' + Date.now() }]);
      setStatus('connected');
    });
    socket.on('message', (msg: Msg) => setMessages(prev => [...prev, msg]));
    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, [token]);

  function sendMessage() {
    if (!input.trim()) return;
    const msg: Msg = { text: input, sender: user?.name || 'Anonyme', group };
    socketRef.current?.emit('message', msg);
    setInput('');
  }

  return (
    <div className="space-y-6">
      {/* Héros illustré de la messagerie */}
      <section
        className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm"
        aria-label="Messagerie"
      >
        <div
          className="h-[200px] w-full bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1525182008055-f88b95ff7980?q=80&w=1600&auto=format&fit=crop')" }}
        >
          <div className="h-full w-full bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
        </div>
        <div className="absolute inset-0 flex items-end p-6">
          <h1 className="text-2xl font-semibold text-white">Messagerie</h1>
        </div>
      </section>
      {/* Sélection du groupe de discussion */}
      <div className="card p-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
          <h2 className="text-lg font-semibold text-primary-700 flex-1">Chat</h2>
          <select className="rounded border-gray-300" value={group} onChange={e => setGroup(e.target.value)}>
            <option value="Général">Général</option>
            <option value="Étudiants">Étudiants</option>
            <option value="Professeurs">Professeurs</option>
            <option value="Admins">Admins</option>
          </select>
        </div>
        <div className="h-64 overflow-y-auto border rounded p-3 bg-gray-50">
          {loadError === 'unauthenticated' ? (
            <div className="text-sm text-gray-700">Connectez-vous pour voir les messages.</div>
          ) : loadError === 'failed' ? (
            <div className="text-sm text-gray-700">Impossible de charger les messages.</div>
          ) : messages.filter(m => m.group === group).length === 0 ? (
            <div className="text-sm text-gray-700">Aucun message pour ce groupe.</div>
          ) : (
            messages.filter(m => m.group === group).map((m) => (
              <div key={m._id ?? m.createdAt ?? Math.random()} className="text-sm text-gray-700">
                <span className="font-semibold text-primary-700">{m.sender}:</span> {m.text}
              </div>
            ))
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <input className="flex-1 rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500" value={input} onChange={e => setInput(e.target.value)} placeholder="Votre message..." disabled={!token} />
          <button className="btn-primary" onClick={sendMessage} disabled={!token}>Envoyer</button>
        </div>
        <div className="mt-2 text-xs text-gray-500">Statut: {status}{loadError ? ` — ${loadError}` : ''}</div>
      </div>
    </div>
  )
}


