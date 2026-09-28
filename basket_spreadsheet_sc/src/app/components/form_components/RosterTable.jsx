"use client"
import PlayerRow from "./PlayerRow"
import CoachFoulsCells from "./CoachFoulCells"
import { useFormContext } from "react-hook-form"

const ROWS = Array.from({ length: 12 }, (_, i) => i + 4) // dorsales 4..15

export default function RosterTable({ group, quarter }) {
  const { register } = useFormContext()

  return (
    <table className="w-full border-collapse border border-black text-xs">
      <thead>
        <tr>
          <th rowSpan={2} className="border border-black w-10 px-1 py-0.5">Licence no.</th>
          <th rowSpan={2} className="border border-black px-1 py-0.5 text-center">Players</th>
          <th rowSpan={2} className="border border-black w-10 px-1 py-0.5">No.</th>
          <th rowSpan={2} className="border border-black w-12 px-1 py-0.5">Player in</th>
          <th colSpan={5} className="border border-black border-b-0 px-1 py-0.5">Fouls</th>
        </tr>
        <tr>
          {[1, 2, 3, 4, 5].map((n) => (
            <th key={n} className="w-6 px-1 py-0.5">{n}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.map((rowNumber, index) => (
          <PlayerRow
            quarter={quarter}
            key={rowNumber}
            group={group}
            index={index}
            totalRows={ROWS.length}
          />
        ))}

        <tr>
          <td colSpan={6} className="border border-black text-left font-bold p-0">
            <div className="flex items-stretch h-[24px]">
              <label className="mr-1 ml-1 whitespace-nowrap flex items-center shrink-0 w-[115px]">
                Head coach
              </label>
              <input
                type="text"
                className="w-[40px] shrink-0 m-0 py-0 px-1 bg-transparent
                border-0 border-x border-black
                focus:outline-none leading-tight"
                {...register(`${group}.coachAditionalInput`)}
              />
              <input
                type="text"
                className="flex-1 min-w-0 m-0 py-0 px-1 bg-transparent
                   border-0 focus:outline-none leading-tight"
                {...register(`${group}.coachName`)}
              />
            </div>
            
          </td>
          <CoachFoulsCells group={group} role="coach" />
        </tr>
        <tr>
         <td colSpan={6} className="border border-black text-left font-bold p-0">
          <div className="flex items-stretch h-[24px]">
            <label className="mr-1 ml-1 whitespace-nowrap flex items-center shrink-0 w-[115px]">
             First assistant Coach
            </label>

            <input
              type="text"
              className="w-[40px] shrink-0 m-0 py-0 px-1 bg-transparent
                border-0 border-x border-black
                focus:outline-none leading-tight"
              {...register(`${group}.assistantCoachAditionalInput`)}
            />

            <input
              type="text"
              className="flex-1 min-w-0 m-0 py-0 px-1 bg-transparent
                   border-0 focus:outline-none leading-tight"
              {...register(`${group}.assistantCoachName`)}
            />
          </div>
         </td>
          <CoachFoulsCells group={group} role="assistantCoach" />
        </tr>
      </tbody>
    </table>
  )
}