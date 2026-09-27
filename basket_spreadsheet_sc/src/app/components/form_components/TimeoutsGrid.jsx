"use client"
import TimeoutBox from "./TimeoutBox"
import { useEffect, useRef } from "react"
import { useFormContext } from "react-hook-form"
import { useMatchStore } from "../../utils/store/matchStore"
// fila 0 -> primera mitad (cuartos 1-2), termina al pasar a Q3
// fila 1 -> segunda mitad (cuartos 3-4), termina al pasar a Q5 (overtime)
// fila 2 -> tiempos extra, sin cierre automático por ahora
const ROWS = [
  { boxes: [1, 2], endsAtQuarter: 2 },
  { boxes: [3, 4, 5], endsAtQuarter: 4 },
  { boxes: [6, 7, 8], endsAtQuarter: null },
]

const colorForPeriod = (period) => {
  if (period == 1 || period == 3){
    return "text-red-600"
  }else{
    return "text-black"
  }
}

export default function TimeoutsGrid({ group }) {
  const quarter = useMatchStore((state) => state.quarter)
  const { getValues, setValue } = useFormContext()
  const prevQuarterRef = useRef(quarter)
  const color = colorForPeriod(quarter)

  useEffect(() => {
    const prevQuarter = prevQuarterRef.current
    if (quarter > prevQuarter) {
      ROWS.forEach((row) => {
        if (row.endsAtQuarter === prevQuarter) {
          row.boxes.forEach((boxid) => {
            const fieldName = `${group}.timeouts.${boxid}`
            const current = getValues(fieldName)
            if (current === undefined || current === "" || current === null) {
              setValue(fieldName, "=")
            }
          })
        }
      })
    }
    prevQuarterRef.current = quarter
  }, [quarter, group, getValues, setValue])

  return (
    <div className="flex flex-col gap-1">
      {ROWS.map((row) => (
        <div key={group + String(row.boxes[0])} className="flex">
          {row.boxes.map((boxid) => (
            <TimeoutBox key={boxid} group={group} color={color} boxid={boxid} />
          ))}
        </div>
      ))}
    </div>
  )
}