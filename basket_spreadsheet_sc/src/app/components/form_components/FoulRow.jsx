"use client"
import FoulBox from "./FoulBox"
export default function FoulRow({ group, period, count, quarter, color }) {

  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <FoulBox key={i} group={group} period={period} index={i} quarter={quarter} color ={color}/>
      ))}
    </div>
  )
}