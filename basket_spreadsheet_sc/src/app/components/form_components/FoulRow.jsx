"use client"
import FoulBox from "./FoulBox"
export default function FoulRow({ group, period, count, color }) {

  return (
    <div className="flex">
      {Array.from({ length: count }).map((_, i) => (
        <FoulBox key={i} group={group} period={period} index={i} color ={color}/>
      ))}
    </div>
  )
}