"use client"
import { memo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import DorsalSelect from "./DorsalSelect";
import ScoreNumberCell from "./ScoreNumberCell";
import { useMatchStore } from "../../utils/store/matchStore";

export const colorForPeriod = (period) =>
  period == 1 || period == 3 ? "text-red-600" : "text-black";

// Mismo criterio que colorForPeriod, pero en hex para usarlo en border-color
const hexForPeriod = (period) =>
  period == 1 || period == 3 ? "#dc2626" : "#000000";

function ScoreRow({ team, value, name, players }) {
  const { setValue, getValues } = useFormContext();

  // Selectores primitivos: solo re-renderiza la fila cuyo valor cambia
  const endMark = useMatchStore((s) => s.endMarks[team][value]); // cuarto que cerró esta fila, o undefined
  const isFinal = useMatchStore((s) => s.finalRow[team] === value);

  const handleNumberChange = useCallback((dorsalName, dorsalValue, previousDorsal) => {
    const state = useMatchStore.getState();
    const isA = team === "A";
    const currentScore = isA ? state.teamAcurrentScore : state.teamBcurrentScore;
    const previousPoints = getValues(`${name}.points`);

    // 1) El usuario borró el select
    if (!dorsalValue) {
      if (!previousPoints) return;

      // Una fila que cerró un cuarto queda bloqueada
      if (state.endMarks[team][value] !== undefined) {
        setValue(dorsalName, previousDorsal);
        alert("Esta anotación cerró un cuarto y no se puede borrar.");
        return;
      }

      // Solo se puede borrar la última anotación del equipo
      if (value !== currentScore) {
        setValue(dorsalName, previousDorsal);
        alert(`Solo puedes borrar la última anotación (${currentScore}). Borra primero las posteriores.`);
        return;
      }

      (isA ? state.undoTeamAscore : state.undoTeamBscore)();
      setValue(`${name}.points`, null);
      setValue(`${name}.period`, null);
      return;
    }

    // 2) Cambio de jugador en una fila ya anotada
    if (previousPoints) return;

    // 3) Anotación nueva
    const diff = value - currentScore;

    if (diff < 1 || diff > 3) {
      setValue(dorsalName, "");
      alert(`Anotación inválida: la diferencia con el marcador actual es ${diff}. Solo se permiten 1, 2 o 3 puntos.`);
      return;
    }

    setValue(`${name}.points`, diff);
    setValue(`${name}.period`, state.quarter);

    (isA ? state.increaseTeamAscore : state.increaseTeamBscore)(diff, dorsalName);
  }, [team, value, name, setValue, getValues]);

  const quarter = useMatchStore((state) => state.quarter);
  const color = colorForPeriod(quarter);

  // Final del partido: 2 líneas negras gruesas. Fin de cuarto: línea gruesa del color del cuarto.
  const rowStyle = isFinal
    ? { borderBottom: "6px double #000000" } // "double" necesita >= 3px para verse como 2 líneas
    : endMark !== undefined
      ? { borderBottom: `3px solid ${hexForPeriod(endMark)}` }
      : undefined;

  const numberCell = <ScoreNumberCell key="number" name={name} value={value} endMark={endMark} />;
  const selectCell = (
    <DorsalSelect
      key="select"
      gname={name}
      players={players}
      color={color}
      handleChange={handleNumberChange}
    />
  );

  return (
    <tr style={rowStyle}>
      {team === "A" ? [selectCell, numberCell] : [numberCell, selectCell]}
    </tr>
  );
}

export default memo(ScoreRow);