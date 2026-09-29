import ScoreColumn from "../form_components/ScoreColumn"
import { useWatch, useFormContext } from "react-hook-form"
import { useMemo } from "react";
export function useTeamPlayers(team) {
  const { control } = useFormContext()
  const players = useWatch({ control, name: `team${team}.players` }) ?? []
  return players
    .filter((p) => p?.number !== undefined && p.number !== "")
    .map((p) => ({ number: p.number, name: p.name }))
}
export default function RunningScoreForm() {
    const playersA = useTeamPlayers("A")
    const playersB = useTeamPlayers("B")
    return(
     <div>
        <div >
            <p className="text-center font-bold border-r border-l" style={{fontSize:20}}>Running Score</p>
        </div>
        <div className="flex flex-row border border-b-2">
            <div className="flex flex-row " >
                <ScoreColumn team="A" range={[1,40]} players={playersA} />
                <ScoreColumn team="B" range={[1,40]} players={playersB}/>
            </div>
            <div className="flex flex-row">
                <ScoreColumn team="A" range={[41,80]} players={playersA}/>
                <ScoreColumn team="B" range={[41,80]} players={playersB}/>
            </div>
            <div className="flex flex-row">
                <ScoreColumn team="A" range={[81,120]} players={playersA}/>
                <ScoreColumn team="B" range={[81,120]} players={playersB}/>
            </div>
            <div className="flex flex-row">
                <ScoreColumn team="A" range={[121,160]} players={playersA}/>
                <ScoreColumn team="B" range={[121,160]} players={playersB}/>
            </div>
        </div>


    </div>)
}