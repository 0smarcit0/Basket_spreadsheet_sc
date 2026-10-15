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

  const circleSize =
    size === "text-base" ? "h-7 min-w-[1.75rem]" : "h-5 min-w-[1.25rem]"

  const content = (
    <>
      {option.label}
      {option.sup !== null && <sub className="text-[9px]">{option.sup}</sub>}
    </>
  )

  if (option.circle) {
    return (
      <span
        className={`${size} ${colorClass} ${circleSize} inline-flex items-center justify-center rounded-full border border-current px-0.5 font-bold leading-none`}
      >
        {content}
      </span>
    )
  }

  
  return (
    <span className={`${size} font-bold leading-none ${colorClass}`}>
      {content}
    </span>
  )
}

function FoulPicker({ field, types, flatTypes, disabled = false, className = "" }) {
  const gameEnded = useMatchStore((s) => s.gameEnded)
  const quarter = useMatchStore((s) => s.quarter)
  const [open, setOpen] = useState(false)

  const { type: currentType, color: currentColor } = parseValue(field.value)
  const liveColor = getColorForQuarter(quarter)

  const handleSelect = (optionValue) => {
    field.onChange(optionValue === "" ? "" : `${optionValue}:${liveColor}`)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center justify-center disabled:cursor-not-allowed ${className}`}
        disabled={gameEnded || disabled}
      >
        <FoulLabel type={currentType} color={currentColor} types={flatTypes} />
      </button>

      {open && !disabled && (
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
    </>
  )
}
export function SixthFoulCell({ name, types, disabled = false }) {
  const { field } = useController({ name, defaultValue: "" })
  const flatTypes = useMemo(() => types.flatMap((c) => c.options), [types])

  return (
    <FoulPicker
      field={field}
      types={types}
      flatTypes={flatTypes}
      disabled={disabled}
      className="absolute left-full top-0 h-full w-6"
    />
  )
}
// Celda de foul genérica: recibe el nombre completo del campo RHF y el set de tipos
export function FoulCell({ name, types, neighbors = {}, rowNames = [], disabled = false, extra = null }) {
  const gameEnded = useMatchStore((state) => state.gameEnded)
  const { getValues } = useFormContext()
  const secondHalfStarted = useMatchStore((state) => state.halftimeCaptured)
  const { field } = useController({ name, defaultValue: "" })
  const [frozenLines, setFrozenLines] = useState("")

  const flatTypes = useMemo(() => types.flatMap((c) => c.options), [types])

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

  

  return (
    <td className={`relative border border-black p-0 text-center w-6 h-1 ${frozenLines}`}>
      <FoulPicker
        field={field}
        types={types}
        flatTypes={flatTypes}
        disabled={disabled}
        className="w-full h-full"
      />

      {gameEnded && !field.value && !disabled && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-black" />
      )}

      {extra}
    </td>
  )
}