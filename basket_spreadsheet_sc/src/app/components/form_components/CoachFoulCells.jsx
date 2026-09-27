"use client"
import { useMatchStore } from "../../utils/store/matchStore"
import { FoulCell } from "./FoulShared"

const COACH_FOUL_TYPES = [
  { value: "C", label: "C" },
  { value: "B", label: "B" },
]

const FOULS_COUNT = 3 // mismo número que jugadores, para que las columnas alineen

export default function CoachFoulsCells({ group, role }) {
  const boundaryKey = `${group}-${role}`
  const boundary = useMatchStore((state) => state.halftimeBoundaries[boundaryKey])

  return (
    <>
      {[1, 2, 3].map((f) => (
        
        <FoulCell
          key={f}
          name={`${group}.${role}.fouls.${f}`}
          types={COACH_FOUL_TYPES}
          isSecondHalf={boundary !== undefined && f === boundary}
        />
      ))}
    </>
  )
}