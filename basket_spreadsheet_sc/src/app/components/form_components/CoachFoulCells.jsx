"use client"
import { useMemo } from "react"
import { FoulCell } from "./FoulShared"

const COACH_FOUL_TYPES = [
  { value: "C", label: "C" },
  { value: "B", label: "B" },
]

const FOULS_COUNT = 3

export default function CoachFoulsCells({ group, role, aboveRole = null, belowRole = null }) {
  const cell = (r, f) => `${group}.${r}.fouls.${f}`

  const rowNames = useMemo(
    () => Array.from({ length: FOULS_COUNT }, (_, k) => cell(role, k + 1)),
    [group, role]
  )

  return (
    <>
      {Array.from({ length: FOULS_COUNT }, (_, k) => k + 1).map((f) => (
        <FoulCell
          key={f}
          name={cell(role, f)}
          types={COACH_FOUL_TYPES}
          rowNames={f === 1 ? rowNames : undefined}
          neighbors={{
            left: f > 1 ? cell(role, f - 1) : null,
            right: f < FOULS_COUNT ? cell(role, f + 1) : null,
            top: aboveRole ? cell(aboveRole, f) : null,
            bottom: belowRole ? cell(belowRole, f) : null,
          }}
        />
      ))}
    </>
  )
}