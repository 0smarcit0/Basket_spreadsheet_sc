"use client"
import { useRef } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import FoulsCells from "./FoulsCells"
import PlayerInToggle from "./PlayerInToggle"

const DOUBLE_TAP_DELAY = 300 

export default function PlayerRow({ group, index, totalRows }) {
  const { register, control, getValues, setValue, trigger } = useFormContext()
  const base = `${group}.players.${index}`

  const captainIndex = useWatch({ control, name: `${group}.captainIndex` })
  const isCaptain = String(captainIndex) === String(index)

  
  const lastTapRef = useRef(0)

  const revalidateNumbers = () => {
    const names = Array.from({ length: totalRows }, (_, i) => `${group}.players.${i}.number`)
    trigger(names)
  }

  const handleSetCaptain = () => {
    setValue(`${group}.captainIndex`, index, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  
  const handleNameClick = () => {
    const now = Date.now()
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      handleSetCaptain()
      lastTapRef.current = 0 
    } else {
      lastTapRef.current = now
    }
  }

  return (
    <tr className="">
      <td className="border border-black p-0">
        <input
          type="text"
          disabled
          className="w-full bg-gray-100 px-1 py-0.5 text-center cursor-not-allowed"
          {...register(`${base}.licence`)}
        />
      </td>

      <td className="border border-black p-0">
        <div className="flex items-center gap-1 px-1">
          <input
            type="text"
            placeholder="Player name"
            className="flex-1 bg-transparent px-1 py-0.5 focus:outline-none"
            onClick={handleNameClick}
            
            style={{ touchAction: "manipulation" }}
            title="Doble click / doble tap para asignar capitán"
            {...register(`${base}.name`)}
          />
          {isCaptain && (
            <span className="text-red-500 font-bold whitespace-nowrap">(CAP)</span>
          )}

          {index === 0 && (
            <input
              type="hidden"
              {...register(`${group}.captainIndex`, {
                required: "Debe designarse un capitán",
              })}
            />
          )}
        </div>
      </td>

      <td className="border border-black p-0">
        <input
          type="text"
          className="w-full text-center bg-transparent px-1 py-0.5 focus:outline-none"
          {...register(`${base}.number`, {
            onChange: revalidateNumbers,
            validate: (value) => {
              if (value === "" || value === undefined || value === null) return true
              const players = getValues(`${group}.players`) || []
              const duplicate = players.some(
                (p, i) => i !== index && String(p?.number ?? "") === String(value)
              )
              return duplicate ? "Dorsal repetido" : true
            },
          })}
        />
      </td>

      <td className="border border-black p-0 text-center">
        <PlayerInToggle group={group} index={index} />
      </td>

      <FoulsCells group={group} index={index} />
    </tr>
  )
}