"use client"
import TimeoutBox from "./TimeoutBox"
import { useFormContext, useWatch } from "react-hook-form"
import { useMatchStore } from "../../utils/store/matchStore"

const ROWS = [
  { boxes: [1, 2], endsAtQuarter: 2, label: "H1" },
  { boxes: [3, 4, 5], endsAtQuarter: 4, label: "H2" },
  { boxes: [6, 7, 8], endsAtQuarter: null, label: "OT" },
]

const colorForPeriod = (period) =>
  period == 1 || period == 3 ? "text-red-600" : "text-black"

const isEmpty = (v) => v === undefined || v === null || v === ""

export default function TimeoutsGrid({ group }) {
  const { control } = useFormContext()
  const quarter = useMatchStore((state) => state.quarter)
  const gameEnded = useMatchStore((state) => state.gameEnded)
  const timeouts = useWatch({ control, name: `${group}.timeouts` })
  const color = colorForPeriod(quarter)

  // Celda tachada: vacía y (su mitad ya terminó o el partido terminó)
  const isVoided = (row, boxid) => {
    if (!isEmpty(timeouts?.[boxid])) return false
    const rowEnded = row.endsAtQuarter !== null && quarter > row.endsAtQuarter
    return rowEnded || gameEnded
  }

  return (
    <div className="flex flex-col gap-1">
      {ROWS.map((row) => (
        <div key={group + String(row.boxes[0])} className="flex flex-row">
          <span style={{ fontSize: 16 }} className="pr-1"> {row.label} </span>
          <div className="flex">
            {row.boxes.map((boxid) => {
              const voided = isVoided(row, boxid)
              return (
                <TimeoutBox
                  key={boxid}
                  group={group}
                  color={color}
                  boxid={boxid}
                  isVoid={voided}
                  disabled={voided || gameEnded}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}