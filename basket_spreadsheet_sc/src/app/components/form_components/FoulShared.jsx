"use client"
import { useController, useFormContext } from "react-hook-form"
import { useState, useRef, useEffect } from "react"
import { useMatchStore } from "../../utils/store/matchStore"

export function getColorForQuarter(quarter) {
  if (quarter === 1 || quarter === 3) return "red"
  return "black"
}

export const COLOR_CLASSES = {
  red: "text-red-600",
  black: "text-black",
}

export function parseValue(value) {
  if (!value) return { type: "", color: null }
  const [type, color] = value.split(":")
  return { type, color: color || "black" }
}

export function FoulLabel({ type, color, types, size = "text-xs" }) {
  const option = types.find((o) => o.value === type)
  if (!option || !option.value) return null
  const colorClass = COLOR_CLASSES[color] || "text-black"
  return (
    <span className={`${size} font-bold leading-none ${colorClass}`}>
      {option.label}
      {option.sup && <sub className="text-[9px]">{option.sup}</sub>}
    </span>
  )
}

// Celda de foul genérica: recibe el nombre completo del campo RHF y el set de tipos
export function FoulCell({ name, types, neighbors = {}, rowNames = [] }) {
  const gameEnded = useMatchStore((state) => state.gameEnded)
  const { getValues } = useFormContext()
  const quarter = useMatchStore((state) => state.quarter)
  const secondHalfStarted = useMatchStore((state) => state.halftimeCaptured)
  const { field } = useController({ name, defaultValue: "" })
  const [open, setOpen] = useState(false)
  const [frozenLines, setFrozenLines] = useState("") // bordes congelados al medio tiempo
  const ref = useRef(null)

  // Foto del estado en el momento en que termina la primera mitad
  useEffect(() => {
    if (!secondHalfStarted) {
      setFrozenLines("")
      return
    }
    const used = (n) => !!getValues(n)
    const self = used(name)
    const { left, right, top, bottom } = neighbors
    const lines = []

    // Frontera entre celda usada y no usada: ambas celdas dibujan el borde
    if (left && used(left) !== self) lines.push("border-l-[6px]")
    if (right && used(right) !== self) lines.push("border-r-[6px]")
    if (top && used(top) !== self) lines.push("border-t-[6px]")
    if (bottom && used(bottom) !== self) lines.push("border-b-[6px]")

    // Fila completamente vacía: borde izquierdo en su primera celda
    if (rowNames.length > 0 && rowNames.every((n) => !used(n))) {
      lines.push("border-l-[6px]")
    }

    setFrozenLines([...new Set(lines)].join(" "))
  }, [secondHalfStarted]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const { type: currentType, color: currentColor } = parseValue(field.value)
  const liveColor = getColorForQuarter(quarter)

  const handleSelect = (optionValue) => {
    field.onChange(optionValue === "" ? "" : `${optionValue}:${liveColor}`)
    setOpen(false)
  }

  return (
    <td className={`relative border border-black p-0 text-center w-6 h-1 ${frozenLines}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-full flex items-center justify-center"
        disabled = {gameEnded}
      >
        <FoulLabel type={currentType} color={currentColor} types={types} />
      </button>
      {gameEnded && !field.value && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-black" />
      )}

      {open && (
        <div
          ref={ref}
          className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-300 rounded shadow-md z-20 flex flex-col gap-0.5 p-1"
        >
          {types.map((opt) => (
            <button
              key={opt.value || "empty"}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded"
            >
              {opt.value ? (
                <FoulLabel type={opt.value} color={liveColor} types={types} size="text-sm" />
              ) : (
                <span className="text-[10px] text-gray-400">—</span>
              )}
            </button>
          ))}
        </div>
      )}
    </td>
  )
}