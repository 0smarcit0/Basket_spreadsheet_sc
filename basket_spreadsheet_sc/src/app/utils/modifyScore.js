// Modificación del valor de una canasta en el running score.
//
// Sin imports a propósito: recibe el store y el formulario por parámetro,
// así la lógica se puede probar sin React.
//
// Modelo: scoredStack{A|B} es la lista ordenada de filas anotadas (marcador acumulado
// después de cada canasta). Los puntos de la canasta i son stack[i] - stack[i - 1].
// Cambiar el valor de la canasta k en ±1 equivale a sumar ±1 a todos los elementos
// del stack desde k en adelante. El dorsal y el cuarto de cada fila viven en el formulario.

export const MAX_ROW = 160 // filas del running score (4 columnas x 40)
const BASKET_MIN = 1
const BASKET_MAX = 3

const stackKey = (team) => `scoredStack${team}`

// Info de la canasta anotada en `row`, o null si esa fila no tiene anotación
export function getBasketInfo(state, team, row) {
  const stack = state[stackKey(team)] ?? []
  const index = stack.indexOf(row)
  if (index === -1) return null

  const points = row - (index > 0 ? stack[index - 1] : 0)
  const last = stack[stack.length - 1]

  return {
    index,
    points,
    canReduce: points > BASKET_MIN,
    canIncrease: points < BASKET_MAX && last + 1 <= MAX_ROW,
  }
}

// Las marcas del store (fin de cuarto, prórroga) están indexadas por fila:
// las de la fila modificada y las posteriores se corren junto con su canasta
const shiftKeys = (marks = {}, fromRow, delta) =>
  Object.fromEntries(
    Object.entries(marks).map(([r, v]) => {
      const n = Number(r)
      return [n >= fromRow ? n + delta : n, v]
    })
  )

/**
 * @param store     el store de zustand (useMatchStore)
 * @param getValues getValues de react-hook-form
 * @param setValue  setValue de react-hook-form
 * @param team      "A" | "B"
 * @param row       fila de la canasta a modificar
 * @param delta     +1 (aumentar) | -1 (reducir)
 * @returns true si se aplicó el cambio
 */
export function modifyBasket({ store, getValues, setValue, team, row, delta }) {
  const state = store.getState()
  if (state.gameEnded) return false

  const info = getBasketInfo(state, team, row)
  if (!info) return false
  if (delta === -1 && !info.canReduce) return false
  if (delta === 1 && !info.canIncrease) return false

  const stack = state[stackKey(team)]
  const base = `runningScore.${team}`
  const entryPeriod = Number(getValues(`${base}.${row}.period`))

  // 1) Canasta modificada + todas las posteriores, leídas ANTES de tocar el formulario
  const affected = stack.slice(info.index).map((r, i) => {
    const cell = getValues(`${base}.${r}`) ?? {}
    return {
      oldRow: r,
      newRow: r + delta,
      dorsal: cell.dorsal ?? "",
      period: cell.period ?? null,
      points: i === 0 ? info.points + delta : (cell.points ?? null),
    }
  })

  // 2) Formulario: primero se vacían las filas viejas y luego se escriben las nuevas
  //    (al correrse una fila se pisan entre sí, por eso no se puede hacer en un solo paso)
  affected.forEach(({ oldRow }) => {
    setValue(`${base}.${oldRow}.dorsal`, "")
    setValue(`${base}.${oldRow}.points`, null)
    setValue(`${base}.${oldRow}.period`, null)
  })
  affected.forEach(({ newRow, dorsal, points, period }) => {
    setValue(`${base}.${newRow}.dorsal`, dorsal)
    setValue(`${base}.${newRow}.points`, points)
    setValue(`${base}.${newRow}.period`, period)
  })

  // 3) Store
  const newStack = stack.map((r, i) => (i >= info.index ? r + delta : r))
  const newCurrent = newStack[newStack.length - 1]
  const cellName = `${base}.${newCurrent}.dorsal`

  store.setState((s) => ({
    [stackKey(team)]: newStack,
    [`team${team}currentScore`]: newCurrent,
    [`numberCellName${team}`]: cellName,
    [`ScoreCellName${team}`]: cellName,
    endMarks: { ...s.endMarks, [team]: shiftKeys(s.endMarks[team], row, delta) },
    overtimeMarks: { ...s.overtimeMarks, [team]: shiftKeys(s.overtimeMarks[team], row, delta) },
  }))

  // 4) Si la canasta es de un cuarto ya cerrado, su total en "Scores" cambia en delta
  //    (los totales de los demás cuartos no cambian: ambos extremos se corren igual)
  if (entryPeriod >= 1 && entryPeriod < state.quarter) {
    const path = `scores.${team}.${entryPeriod >= 5 ? "overtimes" : entryPeriod}`
    setValue(path, (Number(getValues(path)) || 0) + delta)
  }

  return true
}
