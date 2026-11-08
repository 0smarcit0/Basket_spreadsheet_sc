"use client"
import { useFormContext } from "react-hook-form"
import Modal from "../Modal"
import { useMatchStore } from "../../utils/store/matchStore"
import { getBasketInfo, modifyBasket } from "../../utils/modifyScore"

const buttonClass =
  "w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition-colors " +
  "hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent " +
  "dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"

/**
 * target: { team: "A" | "B", row: number } | null
 */
export default function ModifyScoreModal({ target, onClose }) {
  const { getValues, setValue } = useFormContext()

  const info = target
    ? getBasketInfo(useMatchStore.getState(), target.team, target.row)
    : null

  const apply = (delta) => {
    modifyBasket({
      store: useMatchStore,
      getValues,
      setValue,
      team: target.team,
      row: target.row,
      delta,
    })
    onClose()
  }

  return (
    <Modal open={!!target && !!info} onClose={onClose} title="Modificación de Canasta" size="sm">
      {target && info && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Equipo {target.team} · fila {target.row} · canasta de {info.points}{" "}
            {info.points === 1 ? "punto" : "puntos"}
          </p>

          <p>¿Qué modificación desea hacer?</p>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={!info.canReduce}
              onClick={() => apply(-1)}
              className={buttonClass}
            >
              Reducir valor de la canasta en 1
            </button>
            <button
              type="button"
              disabled={!info.canIncrease}
              onClick={() => apply(1)}
              className={buttonClass}
            >
              Aumentar valor de la canasta en 1
            </button>
          </div>

          {!info.canReduce && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              La canasta ya vale el mínimo (1 punto).
            </p>
          )}
          {!info.canIncrease && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {info.points >= 3
                ? "La canasta ya vale el máximo (3 puntos)."
                : "No se puede aumentar: se superaría la fila 160 de la planilla."}
            </p>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Las anotaciones siguientes de este equipo se correrán una fila.
          </p>
        </div>
      )}
    </Modal>
  )
}
