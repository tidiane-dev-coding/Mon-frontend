import React from 'react'

type ModalProps = {
  open: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-white shadow-lg border border-gray-200">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button aria-label="Fermer" className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>
        <div className="p-4">
          {children}
        </div>
        {footer && (
          <div className="border-t px-4 py-3 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}



