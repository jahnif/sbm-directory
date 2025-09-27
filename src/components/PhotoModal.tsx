'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useTranslation } from '@/hooks/useTranslation'

interface PhotoModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  altText: string
}

export default function PhotoModal({
  isOpen,
  onClose,
  imageUrl,
  altText,
}: PhotoModalProps) {
  const { t } = useTranslation()

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Don't render anything if modal is closed
  if (!isOpen) return null

  // Handle click outside to close
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md transition-all duration-300 ease-in-out"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl max-h-[90vh] p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold transition-all duration-200 shadow-lg"
          aria-label={t('common.closePhoto')}
        >
          ×
        </button>

        {/* Image */}
        <div className="relative max-w-full max-h-full">
          <Image
            src={imageUrl}
            alt={altText}
            width={800}
            height={800}
            className="max-w-full max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-xl"
            sizes="(max-width: 768px) 95vw, (max-width: 1200px) 80vw, 60vw"
            priority
          />
        </div>
      </div>
    </div>
  )

  // Use portal to render modal at the body level
  return createPortal(modalContent, document.body)
}