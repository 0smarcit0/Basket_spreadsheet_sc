"use client"
import { memo, useCallback } from "react";
import DorsalSelect from "./DorsalSelect";
import ScoreNumberCell from "./ScoreNumberCell";
import { useMatchStore } from "../../utils/store/matchStore";
/**
 * 
 *
 * @param {"A"|"B"} team
 * @param {number} value  - el puntaje que representa esta fila
 * @param {string} name   - path base del campo, ej: "runningScore.A.15"
 * @param {Array}  [players] - opciones para el select de dorsal
 */
const colorForPeriod = (period) => {
  if (period == 1 || period == 3){
    return "text-red-600"
  }else{
    return "text-black"
  }
}
export default function ScoreRow({ team, value, name, players }) {
    const handleNumberChange = (name)=>{
      /*if (team==="A") {
        const change = useMatchStore((state)=>state.increaseTeamAscore(value, name))
      }else{
        const change = useMatchStore((state)=>state.increaseTeamBscore(value, name))
      }*/
      console.log("hola")
    }
    const quarter = useMatchStore((state) => state.quarter)
    const color = colorForPeriod(quarter)
    const numberCell = <ScoreNumberCell key="number" name={name} value={value}  />
    const selectCell = <DorsalSelect key="select" gname={name} players={players} color={color} handleChange={handleNumberChange}  />

    const cells = team === "A" ? [selectCell, numberCell] : [numberCell, selectCell]

    return <tr>{cells}</tr>
}
