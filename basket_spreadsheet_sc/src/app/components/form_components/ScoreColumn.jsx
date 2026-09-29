"use client"
import ScoreRow from "./ScoreRow";
import { NUMBER_CELL_WIDTH, ROW_HEIGHT } from "./ScoreNumberCell";
import { SELECT_CELL_WIDTH } from "./DorsalSelect";

/**
 
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
