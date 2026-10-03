"use client"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

/**
 * @param {boolean}   open
 * @param {Function}  onClose
 * @param {string}    [title]
 * @param {ReactNode} children
 * @param {ReactNode} [footer]            - zona de botones (se alinea a la derecha)
 * @param {"sm"|"md"|"lg"|"xl"} [size]
 * @param {boolean}   [closeOnOverlay]    - cerrar al tocar fuera (default true)
 * @param {boolean}   [closeOnEsc]        - cerrar con Esc (default true)
 * @param {boolean}   [showCloseButton]   - botón ✕ (default true)
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = "",
}) {
  const [mounted, setMounted] = useState(false) // el portal solo existe en el cliente
  const dialogRef = useRef(null)
  const pressStartedOnOverlay = useRef(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose // siempre la versión más reciente, sin re-ejecutar el efecto

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    dialogRef.current?.focus()

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && closeOnEsc) {
        e.stopPropagation()
        onCloseRef.current?.()
        return
      }
      // Mantiene el Tab dentro del modal
      if (e.key === "Tab" && dialogRef.current) {
        const items = dialogRef.current.querySelectorAll(FOCUSABLE)
        if (items.length === 0) {
          e.preventDefault()
          return
        }
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [open, closeOnEsc])

  if (!mounted || !open) return null

  // Solo cierra si el toque empezó Y terminó sobre el fondo.
  // Así, arrastrar para seleccionar texto dentro y soltar fuera no lo cierra.
  const handleOverlayPointerDown = (e) => {
    pressStartedOnOverlay.current = e.target === e.currentTarget
  }
  const handleOverlayPointerUp = (e) => {
    if (closeOnOverlay && pressStartedOnOverlay.current && e.target === e.currentTarget) {
      onCloseRef.current?.()
    }
    pressStartedOnOverlay.current = false
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onPointerDown={handleOverlayPointerDown}
      onPointerUp={handleOverlayPointerUp}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`flex max-h-[90vh] w-full flex-col rounded-xl bg-white text-gray-900 shadow-xl outline-none dark:bg-gray-900 dark:text-white ${SIZES[size]} ${className}`}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-3 dark:border-gray-700">
            <h2 className="text-lg font-bold">{title}</h2>
            {showCloseButton && (
              <button
                type="button"
                onClick={() => onCloseRef.current?.()}
                aria-label="Cerrar"
                className="rounded-md p-1 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        <div className="overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-3 dark:border-gray-700">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}