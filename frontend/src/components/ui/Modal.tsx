'use client'

import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="rounded bg-white p-4">
        <button className="mb-2" onClick={onClose}>
          닫기
        </button>
        {children}
      </div>
    </div>
  )
}

export default Modal


