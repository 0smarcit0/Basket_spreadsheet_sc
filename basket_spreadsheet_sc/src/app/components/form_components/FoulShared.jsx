"use client"
import { useController, useFormContext } from "react-hook-form"
import { useState, useMemo } from "react"
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
  if (!value) return { type: "", color: null, q: null }
  const [type, color, tag] = value.split(":")
  const q = /^q\d$/.test(tag ?? "") ? Number(tag.slice(1)) : null
  return { type, color: color || "black", q }
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

const TEAM_FOUL_BOXES = 4 // casillas por cuarto en los fouls colectivos
const TEAM_FOUL_PERIODS = 4 // la planilla no tiene casillas para OT
const PLAYER_CELL_RE = /^(team[AB])\.players\.\d+\.fouls\.\d+$/

// Marca la primera casilla libre del cuarto
function markTeamFoul(group, period, getValues, setValue) {
  for (let i = 0; i < TEAM_FOUL_BOXES; i++) {
    const box = `${group}.fouls.p${period}.${i}`
    if (!getValues(box)) {
      setValue(box, "x")
      return
    }
  }
}

// Desmarca la última casilla con "x" del cuarto
function unmarkTeamFoul(group, period, getValues, setValue) {
  for (let i = TEAM_FOUL_BOXES - 1; i >= 0; i--) {
    const box = `${group}.fouls.p${period}.${i}`
    if (getValues(box) === "x") {
      setValue(box, "")
      return
    }
  }
}

// Faltas de jugadores de ese equipo marcadas en ese cuarto
function countTeamFouls(group, period, getValues) {
  const players = getValues(`${group}.players`) || []
  let n = 0
  for (const p of players) {
    for (const v of Object.values(p?.fouls ?? {})) {
      if (parseValue(v).q === period) n++
    }
  }
  return n
}


function FoulPicker({ field, types, flatTypes, disabled = false, className = "" }) {
  const gameEnded = useMatchStore((s) => s.gameEnded)
  const quarter = useMatchStore((s) => s.quarter)
  const { getValues, setValue } = useFormContext()
  const [open, setOpen] = useState(false)

  const { type: currentType, color: currentColor } = parseValue(field.value)
  const liveColor = getColorForQuarter(quarter)

  const handleSelect = (optionValue) => {
    const prev = parseValue(field.value)
    const wasFilled = !!field.value
    const isFilled = optionValue !== ""

    // Cuarto en que se marcó la falta; al editarla se conserva el original
    const tag = wasFilled
      ? prev.q ? `:q${prev.q}` : ""
      : quarter >= 1 ? `:q${quarter}` : ""

    // Sincroniza con los fouls colectivos (solo faltas de jugadores)
    const match = field.name.match(PLAYER_CELL_RE)
    if (match) {
      const group = match[1]
      if (!wasFilled && isFilled) {
        if (quarter >= 1 && quarter <= TEAM_FOUL_PERIODS) {
          markTeamFoul(group, quarter, getValues, setValue)
        }
      } else if (wasFilled && !isFilled && prev.q >= 1 && prev.q <= TEAM_FOUL_PERIODS) {
        // Se cuenta antes de limpiar el campo, por eso el -1
        const remaining = countTeamFouls(group, prev.q, getValues) - 1
        if (remaining < TEAM_FOUL_BOXES) {
          unmarkTeamFoul(group, prev.q, getValues, setValue)
        }
      }
    }

    field.onChange(isFilled ? `${optionValue}:${liveColor}${tag}` : "")
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

const PLAYER_FOUL_RE = /^(team[AB])\.players\.(\d+)\.fouls\.(\d+)$/
const COACH_FOUL_RE = /^(team[AB])\.(coach|assistantCoach)\.fouls\.(\d+)$/

// "teamA.players.0.fouls.2" -> { key: "teamA-0", n: 2 }
// "teamA.coach.fouls.1"     -> { key: "teamA-coach", n: 1 }
function parseFoulName(name) {
  let m = name.match(PLAYER_FOUL_RE)
  if (m) return { key: `${m[1]}-${m[2]}`, n: Number(m[3]) }
  m = name.match(COACH_FOUL_RE)
  if (m) return { key: `${m[1]}-${m[2]}`, n: Number(m[3]) }
  return null
}

export function FoulCell({ name, types, neighbors = {}, rowNames = [], disabled = false, extra = null }) {
  const gameEnded = useMatchStore((state) => state.gameEnded)
  const secondHalfStarted = useMatchStore((state) => state.halftimeCaptured)
  const halftimeBoundaries = useMatchStore((state) => state.halftimeBoundaries)
  const { field } = useController({ name, defaultValue: "" })

  const flatTypes = useMemo(() => types.flatMap((c) => c.options), [types])

  // Una celda "estaba usada al medio tiempo" si su posición <= faltas registradas
  // para ese jugador/coach en halftimeBoundaries
  const usedAtHalftime = (cellName) => {
    const p = parseFoulName(cellName)
    if (!p) return false
    const count = halftimeBoundaries[p.key]
    return count !== undefined && p.n <= count
  }

  let frozenLines = ""
  const own = parseFoulName(name)
  if (secondHalfStarted && own && halftimeBoundaries[own.key] !== undefined) {
    const self = usedAtHalftime(name)
    const { left, right, top, bottom } = neighbors
    const lines = []

    if (left && usedAtHalftime(left) !== self) lines.push("border-l-[6px]")
    if (right && usedAtHalftime(right) !== self) lines.push("border-r-[6px]")
    if (top && usedAtHalftime(top) !== self) lines.push("border-t-[6px]")
    if (bottom && usedAtHalftime(bottom) !== self) lines.push("border-b-[6px]")

    if (rowNames.length > 0 && rowNames.every((n) => !usedAtHalftime(n))) {
      lines.push("border-l-[6px]")
    }
    frozenLines = [...new Set(lines)].join(" ")
  }

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