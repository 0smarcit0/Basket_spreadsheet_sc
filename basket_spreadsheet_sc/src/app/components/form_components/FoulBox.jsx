"use client"
import { useFormContext, useController } from "react-hook-form"
import { useEffect } from "react"
import { useMatchStore } from "../../utils/store/matchStore"

export default function FoulBox({ group, period, index, color }) {
  // Selector booleano: solo re-renderiza cuando este período termina
  const periodEnded = useMatchStore((state) => period < state.quarter)
  const { control, setValue } = useFormContext()
  const name = `${group}.fouls.p${period}.${index}`

  const { field } = useController({ name, control, defaultValue: "" })

  // Al terminar el período, las celdas sin usar se anulan con "="
  useEffect(() => {
    if (periodEnded && !field.value) {
      setValue(name, "=")
    }
  }, [periodEnded, field.value, name, setValue])

  const isFoul = field.value === "x" || field.value === true // true = datos antiguos
  const isVoid = field.value === "="

  return (
    <button
      type="button"
      disabled={isVoid}
      onClick={() => field.onChange(field.value ? "" : "x")}
      className={`relative -mr-[2px] -mb-[2px] box-border h-6 w-6 border-2 border-black bg-transparent focus:z-10 focus:outline-none ${color}`}
    >
      {(isFoul || isVoid) && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 24 24"
          preserveAspectRatio="none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="butt"
        >
          {isFoul ? (
            <>
              {/* X de esquina a esquina */}
              <line x1="0" y1="0" x2="24" y2="24" vectorEffect="non-scaling-stroke" />
              <line x1="24" y1="0" x2="0" y2="24" vectorEffect="non-scaling-stroke" />
            </>
          ) : (
            <>
              {/* Dos líneas horizontales de lado a lado */}
              <line x1="0" y1="8" x2="24" y2="8" vectorEffect="non-scaling-stroke" />
              <line x1="0" y1="16" x2="24" y2="16" vectorEffect="non-scaling-stroke" />
            </>
          )}
        </svg>
      )}
    </button>
  )
}