"use client"
import TimeoutBox from "./TimeoutBox"


export default function TimeoutsGrid({ group, count, perRow = 3 }) {
  const rows = Math.ceil(count / perRow)
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-1">
          {Array.from({ length: perRow }).map((_, c) => {
            const index = r * perRow + c
            if (index >= count) return <div key={c} className="w-8 h-8" />
            return <TimeoutBox key={c} group={group} index={index} />
          })}
        </div>
      ))}
    </div>
  )
}