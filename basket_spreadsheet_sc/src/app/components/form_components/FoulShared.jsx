"use client"
import { useController, useFormContext } from "react-hook-form"
import { useState, useEffect, useMemo } from "react"
import { useMatchStore } from "../../utils/store/matchStore"
import Modal from "../Modal" 

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
      {option.sup !== null && <sub className="text-[9px]">{option.sup}</sub>}
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
  const [frozenLines, setFrozenLines] = useState("")

  const flatTypes = useMemo(() => types.flatMap((c) => c.options), [types])

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

    if (left && used(left) !== self) lines.push("border-l-[6px]")
    if (right && used(right) !== self) lines.push("border-r-[6px]")
    if (top && used(top) !== self) lines.push("border-t-[6px]")
    if (bottom && used(bottom) !== self) lines.push("border-b-[6px]")

    if (rowNames.length > 0 && rowNames.every((n) => !used(n))) {
      lines.push("border-l-[6px]")
    }

    setFrozenLines([...new Set(lines)].join(" "))
  }, [secondHalfStarted]) // eslint-disable-line react-hooks/exhaustive-deps

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
        onClick={() => setOpen(true)}
        className="w-full h-full flex items-center justify-center"
        disabled={gameEnded}
      >
        <FoulLabel type={currentType} color={currentColor} types={flatTypes} />
      </button>

      {gameEnded && !field.value && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-black" />
      )}

      {/* Solo se monta mientras está abierto */}
      {open && (
        <Modal
          open
          onClose={() => setOpen(false)}
          title="Seleccione el tipo de foul"
          size="sm"
          footer={
            field.value ? (
              <button
                type="button"
                onClick={() => handleSelect("")}
                className="rounded-md px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-800"
              >
                Quitar foul
              </button>
            ) : null
          }
        >
          <div className="flex flex-col gap-4">
            {types.map((category) => (
              <section key={category.title}>
                <h3 className="mb-2 text-sm font-bold text-gray-500 dark:text-gray-400">
                  {category.title}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.options.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`flex h-11 min-w-[44px] items-center justify-center rounded-md border px-3 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                        currentType === opt.value
                          ? "border-blue-500 bg-blue-50 dark:bg-gray-800"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      <FoulLabel type={opt.value} color={liveColor} types={flatTypes} size="text-base" />
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Modal>
      )}
    </td>
  )
}