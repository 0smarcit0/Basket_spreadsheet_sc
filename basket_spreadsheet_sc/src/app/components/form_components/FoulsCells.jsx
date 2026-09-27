"use client"
import { useMatchStore } from "../../utils/store/matchStore"
import { FoulCell } from "./FoulShared"

const PLAYER_FOUL_TYPES = [
  { value: "", label: "" },
  { value: "P", label: "P", sup: null },
  { value: "P1", label: "P", sup: "1" },
  { value: "P2", label: "P", sup: "2" },
  { value: "P3", label: "P", sup: "3" },
  { value: "T1", label: "T", sup: "1" },
  { value: "U2", label: "U", sup: "2" },
  { value: "GD", label: "GD", sup: null },
]

export default function FoulsCells({ group, index }) {
  const playerKey = `${group}-${index}`
  const boundary = useMatchStore((state) => state.halftimeBoundaries[playerKey])

  return (
    <>
      {[1, 2, 3, 4, 5].map((f) => (
        <FoulCell
          key={f}
          name={`${group}.players.${index}.fouls.${f}`}
          types={PLAYER_FOUL_TYPES}
          isSecondHalf={boundary !== undefined && f === boundary}
        />
      ))}
    </>
  )
}