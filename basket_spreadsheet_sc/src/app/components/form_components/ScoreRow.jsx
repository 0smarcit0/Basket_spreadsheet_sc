"use client"
import { memo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import DorsalSelect from "./DorsalSelect";
import ScoreNumberCell from "./ScoreNumberCell";
import { useMatchStore } from "../../utils/store/matchStore";

export const colorForPeriod = (period) =>
  period == 1 || period == 3 ? "text-red-600" : "text-black";

function ScoreRow({ team, value, name, players }) {
  const { setValue, getValues } = useFormContext();

  const handleNumberChange = useCallback((dorsalName, dorsalValue, previousDorsal) => {
    const state = useMatchStore.getState();
    const isA = team === "A";
    const currentScore = isA ? state.teamAcurrentScore : state.teamBcurrentScore;
    const previousPoints = getValues(`${name}.points`);

    // 1) El usuario borró el select
    if (!dorsalValue) {
      if (!previousPoints) return; // la fila no tenía anotación

      // Solo se puede borrar la última anotación del equipo
      if (value !== currentScore) {
        setValue(dorsalName, previousDorsal); // restauramos el dorsal
        alert(`Solo puedes borrar la última anotación (${currentScore}). Borra primero las posteriores.`);
        return;
      }

      (isA ? state.undoTeamAscore : state.undoTeamBscore)();
      setValue(`${name}.points`, null);
      setValue(`${name}.period`, null);
      return;
    }

    // 2) La fila ya tenía anotación y solo cambió de jugador:
    //    se conservan points/period y NO se suma otra vez
    if (previousPoints) return;

    // 3) Anotación nueva: validamos la diferencia contra el marcador actual
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

  const numberCell = <ScoreNumberCell key="number" name={name} value={value} />;
  const selectCell = (
    <DorsalSelect
      key="select"
      gname={name}
      players={players}
      color={color}
      handleChange={handleNumberChange}
    />
  );

  return <tr>{team === "A" ? [selectCell, numberCell] : [numberCell, selectCell]}</tr>;
}

export default memo(ScoreRow);