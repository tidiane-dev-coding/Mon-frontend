// Page messagerie: chat en temps réel (Socket.IO)

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '../../auth/AuthContext'
import { api, baseURL } from '../../lib/api'

type Msg = { _id?: string; text: string; sender: string; group: string; createdAt?: string }

export function MessagingPage() {
  const { user, token } = useAuth()
  const [messages, setMessages] = useState<Msg[]>([])
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [loadError, setLoadError] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [group, setGroup] = useState('Général')
  const socketRef = useRef<Socket | null>(null)

  const filteredMessages = useMemo(
    () => messages.filter((m) => m.group === group),
    [messages, group]
  )

  useEffect(() => {
    const explicitSocket = String((import.meta as { env?: { VITE_SOCKET_URL?: string } }).env?.VITE_SOCKET_URL || '').trim()
    const socketUrl = (explicitSocket || baseURL).replace(/\/+$/, '')

    const socket = io(socketUrl, { autoConnect: false, transports: ['websocket', 'polling'] })

    setStatus('connecting')

    const onConnect = () => {
      setMessages((m) => [
        ...m,
        { text: 'Connecté au chat', sender: 'Système', group: 'Général', _id: 'sys-' + Date.now() },
      ])
      setStatus('connected')
    }

    const onMessage = (msg: Msg) => {
      setMessages((prev) => [...prev, msg])
    }

    const onConnectError = (err: Error) => {
      console.error('Socket connect error', err)
      setStatus('disconnected')
    }

    socket.on('connect', onConnect)
    socket.on('message', onMessage)
    socket.on('connect_error', onConnectError)

    ;(async () => {
      try {
        const res = await api.get<Msg[]>('/api/messages')
        setMessages(res.data || [])
        setLoadError(null)
        setStatus('connected')
      } catch (err: unknown) {
        console.error('Failed to load messages', err)
        const statusCode = (err as { response?: { status?: number } })?.response?.status
        if (statusCode === 401) {
          setLoadError('unauthenticated')
        } else {
          setLoadError('failed')
        }
        setStatus('disconnected')
        socket.off('connect', onConnect)
        socket.off('message', onMessage)
        socket.off('connect_error', onConnectError)
        return
      }
      socket.connect()
    })()

    socketRef.current = socket

    return () => {
      socket.off('connect', onConnect)
      socket.off('message', onMessage)
      socket.off('connect_error', onConnectError)
      socket.disconnect()
      socketRef.current = null
    }
  }, [token])

  function sendMessage() {
    if (!input.trim() || !token) return
    const msg: Msg = { text: input, sender: user?.name || 'Anonyme', group }
    socketRef.current?.emit('message', msg)
    setInput('')
  }

  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm"
        aria-label="Messagerie"
      >
        <div
          className="h-[200px] w-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1525182008055-f88b95ff7980?q=80&w=1600&auto=format&fit=crop')",
          }}
        >
          <div className="h-full w-full bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
        </div>
        <div className="absolute inset-0 flex items-end p-6">
          <h1 className="text-2xl font-semibold text-white">Messagerie</h1>
        </div>
      </section>
      <div className="card p-6">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
          <h2 className="text-lg font-semibold text-primary-700 flex-1">Chat</h2>
          <select className="rounded border-gray-300" value={group} onChange={(e) => setGroup(e.target.value)}>
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
          ) : filteredMessages.length === 0 ? (
            <div className="text-sm text-gray-700">Aucun message pour ce groupe.</div>
          ) : (
            filteredMessages.map((m, i) => (
              <div key={m._id ?? `${m.createdAt ?? 'msg'}-${i}`} className="text-sm text-gray-700">
                <span className="font-semibold text-primary-700">{m.sender}:</span> {m.text}
              </div>
            ))
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Votre message..."
            disabled={!token}
          />
          <button type="button" className="btn-primary" onClick={sendMessage} disabled={!token}>
            Envoyer
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Statut: {status}
          {loadError ? ` — ${loadError}` : ''}
        </div>
      </div>
    </div>
  )
}
