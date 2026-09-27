"use client"
import DorsalSelect from "./DorsalSelect";
import ScoreNumberCell from "./ScoreNumberCell";

/**
 * Una fila del running score: el par de celdas (select de dorsal + número
 * de puntaje) para UN valor puntual, ya ordenadas según el equipo.
 *
 * Criterio de orden (a discreción, documentado para que se pueda ajustar):
 * - Equipo A: select primero (izquierda), número después (derecha).
 * - Equipo B: número primero (izquierda), select después (derecha).
 *
 * Esto hace que al renderizar <ScoreColumn team="A" /> seguido de
 * <ScoreColumn team="B" /> una al lado de la otra, los números impresos
 * queden juntos "al centro" y los selects hacia afuera, tal como en el
 * PDF oficial.
 * 
 *
 * @param {"A"|"B"} team
 * @param {number} value  - el puntaje que representa esta fila
 * @param {string} name   - path base del campo, ej: "runningScore.A.15"
 * @param {Array}  [players] - opciones para el select de dorsal
 */
export default function ScoreRow({ team, value, name, players }) {
    const numberCell = <ScoreNumberCell key="number" name={name} value={value} />
    const selectCell = <DorsalSelect key="select" name={name} players={players} />

    const cells = team === "A" ? [selectCell, numberCell] : [numberCell, selectCell]

    return <tr>{cells}</tr>
}
