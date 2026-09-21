"use client"
import { useFormContext, useController } from "react-hook-form"
import FoulRow from "../form_components/FoulRow"
import TimeoutsGrid from "../form_components/TimeoutsGrid"

/**
 * Caja de "Time-out": input numérico de un solo valor, restringido 0-40.
 * Se registra en RHF como `${group}.timeouts.${index}`.
 */


/**
 * Caja de "Team foul": no recibe valor numérico, solo alterna entre
 * vacío y una X al hacer click/tap. Se guarda como boolean en RHF.
 * Se registra como `${group}.fouls.p${period}.${index}`.
 */



/**
 * Fila de N FoulBox para un período dado.
 */


/**
 * Grid de time-outs, organizados en filas de `perRow`.
 */


/**
 * TeamForm — sección completa de un equipo en la planilla.
 *
 * Props:
 *  - team: identificador del equipo, ej. "A" o 1 -> genera el grupo "teamA" / "team1"
 *  - label: texto a mostrar junto al input de nombre (default "Team A")
 *  - timeoutsCount: cantidad total de casillas de time-out (default 6)
 *  - foulsPerPeriod: cantidad de casillas de foul por periodo (default 5)
 */
export default function TeamForm(props) {
  const { register } = useFormContext()
  const group = `team${props.team}`
  const timeoutsCount = 6
  const foulsPerPeriod = 5
  const label = `Team ${props.team}`
  console.log("he sido creado papu")

  return (
    <div className="w-full font-sans text-sm font-bold text-gray-800 border border-black p-2">
      <div>
        {props.quarter}
      </div>
      <div className="flex items-end mb-2">
        <label className="mr-1 whitespace-nowrap">{label}</label>
        <input
          type="text"
          className="flex-1 border-b-2 border-black bg-transparent focus:outline-none px-1 leading-tight"
          {...register(`${group}.name`)}
        />
      </div>

      <div className="flex gap-6">
        <div>
          <p className="mb-1">Time-outs</p>
          <TimeoutsGrid group={group} count={timeoutsCount} perRow={3} />
        </div>

        <div>
          <p className="mb-1">Team fouls</p>

          <div className="flex items-center gap-2 mb-1">
            <span>Period ①</span>
            <FoulRow group={group} period={1} count={foulsPerPeriod} />
            <span>②</span>
            <FoulRow group={group} period={2} count={foulsPerPeriod} />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span>Period ③</span>
            <FoulRow group={group} period={3} count={foulsPerPeriod} />
            <span>④</span>
            <FoulRow group={group} period={4} count={foulsPerPeriod} />
          </div>

          <div className="flex items-center gap-2">
            <span>Extra periods</span>
            <div className="w-8 h-8" />
          </div>
        </div>
      </div>
    </div>
  )
}
