import ScoreColumn from "../form_components/ScoreColumn"
import ModifyScoreModal from "../form_components/ModifyScoreModal"
import { useFormContext } from "react-hook-form"
import { useState, useEffect, useCallback } from "react";
import { useMatchStore } from "../../utils/store/matchStore"; 

export function useTeamPlayers(team) {
  const { watch, getValues } = useFormContext();
  const quarter = useMatchStore((state) => state.quarter); 

  const getProcessedPlayers = () => {
    const currentPlayers = getValues(`team${team}.players`) ?? [];
    return currentPlayers
      .filter((p) => p?.number !== undefined && p.number !== "")
      .map((p) => ({ number: p.number, name: p.name }));
  };

  const [players, setPlayers] = useState(getProcessedPlayers);

  useEffect(() => {
    // Si el partido no ha comenzado (quarter === 0), detenemos la ejecución.
    // Esto evita re-renders y actualizaciones mientras se llena la plantilla inicial.
    if (quarter === 0) return;

    // Cuando el quarter cambia de 0 a un número mayor, forzamos una actualización 
    // inmediata para reflejar los jugadores que se llenaron durante el quarter 0.
    setPlayers(getProcessedPlayers());

    let timeoutId;

    // Iniciamos la suscripción solo si el partido ya está en curso
    const subscription = watch((value, { name, type }) => {
      if (!name || name.startsWith(`team${team}.players`)) {
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
          setPlayers(getProcessedPlayers());
        }, 500); 
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [watch, getValues, team, quarter]); 

  return players;
}

const COLUMN_RANGES = [[1, 40], [41, 80], [81, 120], [121, 160]]

export default function RunningScoreForm() {
    const playersA = useTeamPlayers("A")
    const playersB = useTeamPlayers("B")

    // Canasta que se está modificando: { team, row } o null
    const [target, setTarget] = useState(null)

    // Estable (useCallback) para no romper el memo de ScoreRow
    const handleModify = useCallback((team, row) => {
        if (useMatchStore.getState().gameEnded) return
        setTarget({ team, row })
    }, [])
    const closeModify = useCallback(() => setTarget(null), [])
   
    return(
     <div >
        <div >
            <p className="text-center font-bold border-r border-l" style={{fontSize:20}}>Running Score</p>
        </div>
        <div className="flex flex-row border border-b-2">
            {COLUMN_RANGES.map((range) => (
                <div key={range[0]} className="flex flex-row">
                    <ScoreColumn team="A" range={range} players={playersA} handleModify={handleModify} />
                    <ScoreColumn team="B" range={range} players={playersB} handleModify={handleModify} />
                </div>
            ))}
        </div>

        <ModifyScoreModal target={target} onClose={closeModify} />
    </div>)
}