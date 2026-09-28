"use client"
import { useFormContext } from "react-hook-form";
import { ROW_HEIGHT } from "./ScoreNumberCell";

export const SELECT_CELL_WIDTH = 40 // px

/**
 * Celda "select de dorsal" del running score.
 *
 * Acá se elige el número de camiseta del jugador que hizo la anotación que
 * llevó al equipo a este puntaje. Por ahora las opciones vienen de la prop
 * `players` (si no se pasa nada, el select queda vacío, listo para que más
 * adelante se conecte con la lista real de jugadores de TeamForm).
 *
 * OJO: acá solo está la vista y el registro del campo. Filtrar qué jugadores
 * mostrar, auto-marcar la celda de puntaje al elegir un dorsal, etc. es
 * lógica que se agrega después.
 *
 * @param {string} name - path base del campo, ej: "runningScore.A.15"
 * @param {{number: string|number, name?: string}[]} [players] - opciones disponibles
 */
export default function DorsalSelect({ name, players = [] }) {
    const { register } = useFormContext();

    return (
        <td
            className="border border-black p-0"
            style={{ width: SELECT_CELL_WIDTH, height: ROW_HEIGHT }}
        >
            <select
                defaultValue=""
                className="block w-full h-full appearance-none border-0 rounded-none bg-transparent text-[11px] text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                {...register(`${name}.dorsal`)}
            >
                <option value=""></option>

                {players.map((player) => (
                    <option key={player.number} value={player.number}>
                        {player.number}
                    </option>
                ))}
            </select>
        </td>
    )
}
