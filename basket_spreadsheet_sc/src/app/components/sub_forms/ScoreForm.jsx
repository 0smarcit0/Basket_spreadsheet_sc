"use client"
import { useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { useMatchStore } from "../../utils/store/matchStore"

const PERIODS = [
  { n: 1, label: "Quarter ①", color: "text-red-600" },
  { n: 2, label: "Quarter ②", color: "text-black" },
  { n: 3, label: "Quarter ③", color: "text-red-600" },
  { n: 4, label: "Quarter ④", color: "text-black" },
  { n: "overtimes", label: "Overtimes", color: "text-black" },
]

const FONT = "'Arial Narrow', 'Liberation Sans Narrow', Arial, sans-serif"
const label = "text-[13px] font-bold leading-none whitespace-nowrap"
const line =
  "h-[18px] min-w-0 flex-1 border-0 border-b border-black bg-transparent p-0 px-1 text-center text-[13px] font-bold leading-none focus:outline-none"
const nowHHMM = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
}
export default function ScoresForm({
  teamAName = "teamA.name",
  teamBName = "teamB.name",
}) {
  const { register, setValue, getValues } = useFormContext()

  useEffect(() => {
    const num = (path) => Number(getValues(path)) || 0

    const closePeriod = (q, state) => {
      for (const t of ["A", "B"]) {
        const current = state[`team${t}currentScore`]
        if (q <= 4) {
          let previous = 0
          for (let n = 1; n < q; n++) previous += num(`scores.${t}.${n}`)
          setValue(`scores.${t}.${q}`, current - previous)
        } else {
          let regular = 0
          for (let n = 1; n <= 4; n++) regular += num(`scores.${t}.${n}`)
          setValue(`scores.${t}.overtimes`, current - regular)
        }
      }
    }

    const unsubscribe = useMatchStore.subscribe((state, prev) => {
      if (state.quarter !== prev.quarter && prev.quarter > 0) {
        closePeriod(prev.quarter, state)
      }

      if (state.gameEnded && !prev.gameEnded) {
        if (state.forfeit) {
          const { finalScore, winner } = state.forfeit;
          setValue("scores.final.A", finalScore.A);
          setValue("scores.final.B", finalScore.B);
          setValue(
            "scores.winner",
            winner
              ? (getValues(winner === "A" ? teamAName : teamBName) ?? "")
              : "",
          );
          setValue("scores.gameEndedAt", nowHHMM());
          return;
        }

        closePeriod(state.quarter, state);

        const a = state.teamAcurrentScore;
        const b = state.teamBcurrentScore;
        setValue("scores.final.A", a);
        setValue("scores.final.B", b);
        setValue(
          "scores.winner",
          a > b
            ? (getValues(teamAName) ?? "")
            : b > a
              ? (getValues(teamBName) ?? "")
              : "",
        );
        setValue("scores.gameEndedAt", nowHHMM());
      }
    })

    return unsubscribe
  }, [setValue, getValues, teamAName, teamBName])

  return (
    <div
      className="w-[52.75%] shrink-0 border border-black text-black"
      style={{ fontFamily: FONT }}
    >
      <div className="h-[126px] px-2 py-[6px]">
        <div className="grid grid-cols-[60px_105px_1fr_1fr] gap-x-4 gap-y-[6px]">
          <span className={`${label} row-span-5 self-start text-[18px]`}>Scores</span>

          {PERIODS.map(({ n, label: text, color }) => (
            <div key={n} className="contents">
              <span className={`${label} h-[18px] text-right leading-[18px]`}>{text}</span>
              <div className="flex items-end gap-1">
                <span className={label}>A</span>
                <input  className={`${line} ${color}`} {...register(`scores.A.${n}`)} type="number" />
              </div>
              <div className="flex items-end gap-1">
                <span className={label}>B</span>
                <input  className={`${line} ${color}`} {...register(`scores.B.${n}`)} type="number"/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex h-[58px] flex-col justify-center gap-[10px] border-t border-black px-2">
        <div className="flex items-end gap-1">
          <span className={label}>Final Score</span>
          <span className={`${label} ml-auto pr-1`}>Team A</span>
          <input  className={`${line} max-w-[80px] text-black`} {...register("scores.final.A")} type="number" />
          <span className={`${label} ml-4 pr-1`}>Team B</span>
          <input  className={`${line} max-w-[80px] text-black`} {...register("scores.final.B")} type="number" />
        </div>
        <div className="flex items-end gap-1">
          <span className={label}>Name of winning team</span>
          <input  className={`${line} text-left text-black`} {...register("scores.winner")} type="text"/>
        </div>
      </div>

      <div className="flex h-[36px] items-end gap-1 border-t border-black px-2 pb-[6px]">
        <span className={label}>Game ended at (hh:mm)</span>
        <input className={`${line} text-left text-black`} {...register("scores.gameEndedAt")}/>
      </div>
    </div>
  )
}