"use client"
import { useFormContext } from "react-hook-form";

// Medidas fijas en px, consistentes con el resto de la planilla.
export const NUMBER_CELL_WIDTH = 28 // px
export const ROW_HEIGHT = 18 // px

/**
 * Celda "número impreso" del running score.
 *
 * Muestra el valor de referencia (el puntaje acumulado que representa esa
 * fila) y un checkbox invisible superpuesto que sirve para "marcar" el
 * puntaje cuando corresponda.
 *
 * OJO: acá solo está la vista y el registro del campo en el formulario.
 * CUÁNDO debe marcarse automáticamente (por ejemplo al completar el select
 * de dorsal) es lógica que se agrega después, afuera de este componente.
 *
 * @param {string} name  - path base del campo, ej: "runningScore.A.15"
 * @param {number} value - valor impreso en la celda (el puntaje de esa fila)
 */
export default function ScoreNumberCell({ name, value }) {
    const { register } = useFormContext();

    return (
        <td
            className="border border-black p-0 text-center relative"
            style={{ width: NUMBER_CELL_WIDTH, height: ROW_HEIGHT }}
        >
            {/*
              Checkbox real, funcional, pero invisible: cubre toda la celda
              para que el click en cualquier parte del número lo marque.
              Se declara ANTES del <span> a propósito, para poder usar la
              clase "peer" de Tailwind y darle estilo al número cuando esté
              marcado (ver peer-checked más abajo).
            */}
            <input
                type="checkbox"
                className="peer absolute inset-0 w-full h-full opacity-0 cursor-pointer m-0"
                {...register(`${name}.marked`)}
            />

            {/*
              pointer-events-none para que los clicks atraviesen este span
              y lleguen siempre al checkbox de abajo.
              peer-checked:* aplica un estilo simple (círculo) cuando el
              checkbox está tildado, solo a modo de referencia visual;
              ajustalo o reemplazalo cuando definas la lógica real.
            */}
            <span
                className="
                    pointer-events-none
                    flex items-center justify-center
                    w-full h-full
                    text-[11px] leading-none
                    peer-checked:rounded-full
                    peer-checked:ring-1
                    peer-checked:ring-black
                    dark:peer-checked:ring-white
                "
            >
                {value}
            </span>
        </td>
    )
}
