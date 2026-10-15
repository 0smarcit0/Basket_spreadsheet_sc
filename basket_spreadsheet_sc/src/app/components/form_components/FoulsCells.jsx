"use client"
import { useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { FoulCell, SixthFoulCell } from "./FoulShared"
import { PLAYER_FOUL_CATEGORIES } from "../../utils/foulTypes"


const FOULS_PER_PLAYER = 5
const PLAYERS_COUNT = 12 
 
export default function FoulsCells({ group, index, disabled = false,  }) {
  const { control } = useFormContext()
  const cell = (i, f) => `${group}.players.${i}.fouls.${f}`

  const rowNames = useMemo(
    () => Array.from({ length: FOULS_PER_PLAYER }, (_, k) => cell(index, k + 1)),
    [group, index]
  )
  const sixthName = cell(index, 6)
  const values = useWatch({ control, name: [...rowNames, sixthName] })
  const allFilled = values.slice(0, FOULS_PER_PLAYER).every(Boolean)
  const hasSixth = !!values[FOULS_PER_PLAYER]

  const showSixth = !disabled && (allFilled || hasSixth)
  return (
    <>
      {Array.from({ length: FOULS_PER_PLAYER }, (_, k) => k + 1).map((f) => (
        <FoulCell
          key={f}
          name={cell(index, f)}
          types={PLAYER_FOUL_CATEGORIES}
          disabled={disabled}
          rowNames={f === 1 ? rowNames : undefined}
          extra={
            f === FOULS_PER_PLAYER && showSixth ? (
              <SixthFoulCell name={sixthName} types={PLAYER_FOUL_CATEGORIES} />
            ) : null
          }
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