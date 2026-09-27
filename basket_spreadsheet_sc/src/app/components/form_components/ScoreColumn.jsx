"use client"
import ScoreRow from "./ScoreRow";
import { NUMBER_CELL_WIDTH, ROW_HEIGHT } from "./ScoreNumberCell";
import { SELECT_CELL_WIDTH } from "./DorsalSelect";

/**
 * ScoreColumn representa UN SOLO LADO de la columna del running score
 * (equipo A o equipo B) para un rango de valores dado.
 *
 * Para armar la grilla completa del PDF (4 bloques de A|B, de 1 a 160),
 * se instancia varias veces, una por bloque y por equipo, por ejemplo:
 *
 *   <div className="flex flex-row">
 *     <ScoreColumn team="A" range={[1, 40]} players={teamAPlayers} />
 *     <ScoreColumn team="B" range={[1, 40]} players={teamBPlayers} />
 *     <ScoreColumn team="A" range={[41, 80]} players={teamAPlayers} />
 *     <ScoreColumn team="B" range={[41, 80]} players={teamBPlayers} />
 *     ...
 *   </div>
 *
 * (El armado del grid completo con los 4 bloques queda para RunningScoreForm,
 * este componente solo resuelve UN lado.)
 *
 * @param {"A"|"B"} team           - letra del equipo que representa esta columna
 * @param {[number, number]} range - rango [desde, hasta] inclusive de valores a mostrar
 * @param {string} [name]          - prefijo del path en el formulario (default "runningScore")
 * @param {Array}  [players]       - lista de jugadores para poblar los selects de dorsal
 */
export default function ScoreColumn({ team, range, name = "runningScore", players = [] }) {
    const [from, to] = range;
    const values = Array.from({ length: to - from + 1 }, (_, i) => from + i);
    const columnWidth = NUMBER_CELL_WIDTH + SELECT_CELL_WIDTH;

    return (
        <table
            className="border-collapse"
            style={{ width: columnWidth }}
        >
            <thead>
                <tr>
                    <th
                        colSpan={2}
                        className="border border-black text-[11px] font-bold bg-gray-50 dark:bg-gray-900"
                        style={{ height: ROW_HEIGHT }}
                    >
                        {team}
                    </th>
                </tr>
            </thead>
            <tbody>
                {values.map((value) => (
                    <ScoreRow
                        key={value}
                        team={team}
                        value={value}
                        players={players}
                        name={`${name}.${team}.${value}`}
                    />
                ))}
            </tbody>
        </table>
    )
}
