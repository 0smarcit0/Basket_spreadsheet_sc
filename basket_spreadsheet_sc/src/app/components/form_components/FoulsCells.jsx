"use client"
import { useMemo } from "react"
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

const FOULS_PER_PLAYER = 5
const PLAYERS_COUNT = 12 // ajusta al número de filas de tu planilla

export default function FoulsCells({ group, index }) {
  const cell = (i, f) => `${group}.players.${i}.fouls.${f}`
  

  // Nombres de las 5 celdas de esta fila (solo los usa la primera celda)
  const rowNames = useMemo(
    () => Array.from({ length: FOULS_PER_PLAYER }, (_, k) => cell(index, k + 1)),
    [group, index]
  )

  return (
    <>
      {Array.from({ length: FOULS_PER_PLAYER }, (_, k) => k + 1).map((f) => (
        <FoulCell
          key={f}
          name={cell(index, f)}
          types={PLAYER_FOUL_TYPES}
          rowNames={f === 1 ? rowNames : undefined}
          neighbors={{
            left: f > 1 ? cell(index, f - 1) : null,
            right: f < FOULS_PER_PLAYER ? cell(index, f + 1) : null,
            top: index > 0 ? cell(index - 1, f) : null,
            bottom: index < PLAYERS_COUNT - 1 ? cell(index + 1, f) : null,
          }}
        />
      ))}
    </>
  )
}