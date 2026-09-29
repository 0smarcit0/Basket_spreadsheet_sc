import ScoreColumn from "../form_components/ScoreColumn"
import { useFormContext } from "react-hook-form"
import { useState, useEffect } from "react";
import { useMatchStore } from "../../utils/store/matchStore"; // <-- Importamos tu store

export function useTeamPlayers(team) {
  const { watch, getValues } = useFormContext();
  const quarter = useMatchStore((state) => state.quarter); // <-- Obtenemos el cuarto actual

  // Función para obtener y formatear los jugadores actuales
  const getProcessedPlayers = () => {
    const currentPlayers = getValues(`team${team}.players`) ?? [];
    return currentPlayers
      .filter((p) => p?.number !== undefined && p.number !== "")
      .map((p) => ({ number: p.number, name: p.name }));
  };

  // Estado local para almacenar la lista procesada
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
  }, [watch, getValues, team, quarter]); // <-- quarter se añade a las dependencias

  return players;
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