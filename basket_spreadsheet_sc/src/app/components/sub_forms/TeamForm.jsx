"use client"
import { useFormContext } from "react-hook-form"
import FoulRow from "../form_components/FoulRow"
import TimeoutsGrid from "../form_components/TimeoutsGrid"
import RosterTable from "../form_components/RosterTable"
import { useMatchStore } from "../../utils/store/matchStore"
export default function TeamForm(props) {
  const { register } = useFormContext()
  const quarter = useMatchStore((state) => state.quarter)
  const group = `team${props.team}`
  const foulsPerPeriod = 5
  const label = `Team ${props.team}`

  return (
    <div className="w-full font-sans text-sm font-bold text-gray-800 border border-black p-2">
      <div>{quarter}</div>
      <div className="flex items-end mb-2">
        <label className="mr-1 whitespace-nowrap">{label}</label>
        <input
          type="text"
          className="flex-1 border-b-2 border-black bg-transparent focus:outline-none px-1 leading-tight"
          {...register(`${group}.name`)}
        />
      </div>

      

      <div className="flex gap-6">
        <div className="pb-1">
          <p className="mb-1 text-left" style={{fontSize:18}}>Time-outs</p>
          <TimeoutsGrid group={group} />
        </div>

        <div>
          <p className="mb-1">Team fouls</p>
          <div className="flex items-center gap-2 mb-1">
            <span>Period ①</span>
            <FoulRow group={group} period={1} count={foulsPerPeriod} color="text-red-500" />
            <span>②</span>
            <FoulRow group={group} period={2} count={foulsPerPeriod} color="text-black" />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span>Period ③</span>
            <FoulRow group={group} period={3} count={foulsPerPeriod}  color="text-red-500" />
            <span>④</span>
            <FoulRow group={group} period={4} count={foulsPerPeriod}  color="text-black" />
          </div>
          <div className="flex items-center gap-2">
            <span>Extra periods</span>
            <div className="w-8 h-8" />
          </div>
        </div>
      </div>
      <div className="mb-3">
        <RosterTable group={group}  />
      </div>
    </div>
  )
}