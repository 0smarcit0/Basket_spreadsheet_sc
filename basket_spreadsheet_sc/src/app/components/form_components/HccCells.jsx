"use client"
import { useController, useFormContext } from "react-hook-form"
import { useMatchStore } from "../../utils/store/matchStore"
import { getColorForQuarter, COLOR_CLASSES } from "./FoulShared" // ajusta la ruta si es distinta

const QUARTER_OPTIONS = ["Q1", "Q2", "Q3", "Q4", "OT"]
const MINUTE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

const selectClass =
  "block h-full w-full appearance-none rounded-none border-1 border-black bg-transparent p-0 text-center " +
  "text-[12px] font-bold leading-none cursor-pointer focus:outline-none " +
  "focus:ring-2 focus:ring-inset focus:ring-blue-500"

/**
 * name: prefijo del path en el formulario, ej. "teamA.hcc"
 * Guarda: {name}.quarter  -> "Q1" | "Q2" | "Q3" | "Q4" | "OT"
 *         {name}.minute   -> "1" ... "9"
 *         {name}.color    -> "red" | "black" (color del cuarto en que se marcó)
 */
export default function HccCells({ name }) {
  const { control, setValue, getValues } = useFormContext()

  const { field: quarterField } = useController({ name: `${name}.quarter`, control, defaultValue: "" })
  const { field: minuteField } = useController({ name: `${name}.minute`, control, defaultValue: "" })
  const { field: colorField } = useController({ name: `${name}.color`, control, defaultValue: "" })

  const colorClass = COLOR_CLASSES[colorField.value] || "text-black"

  // Congela el color del cuarto en curso la primera vez que se llena algo;
  // si ambos campos quedan vacíos, libera el color.
  const syncColor = (nextQuarter, nextMinute) => {
    if (!nextQuarter && !nextMinute) {
      setValue(`${name}.color`, "")
    } else if (!getValues(`${name}.color`)) {
      const liveQuarter = useMatchStore.getState().quarter
      setValue(`${name}.color`, getColorForQuarter(liveQuarter))
    }
  }

  return (
    <div className="flex items-end gap-1">

      <div className="flex h-[20px] border border-black">
        <div className="h-full w-[26px] border-r border-black">
          <select
            className={`${selectClass} ${colorClass}`}
            name={quarterField.name}
            ref={quarterField.ref}
            onBlur={quarterField.onBlur}
            value={quarterField.value || ""}
            onChange={(e) => {
              quarterField.onChange(e)
              syncColor(e.target.value, minuteField.value)
            }}
          >
            <option value=""></option>
            {QUARTER_OPTIONS.map((q) => (
              <option key={q} value={q} className="text-black">{q}</option>
            ))}
          </select>
        </div>

        <div className="h-full w-[26px]">
          <select
            className={`${selectClass} ${colorClass}`}
            name={minuteField.name}
            ref={minuteField.ref}
            onBlur={minuteField.onBlur}
            value={minuteField.value || ""}
            onChange={(e) => {
              minuteField.onChange(e)
              syncColor(quarterField.value, e.target.value)
            }}
          >
            <option value=""></option>
            {MINUTE_OPTIONS.map((m) => (
              <option key={m} value={m} className="text-black">{m}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}