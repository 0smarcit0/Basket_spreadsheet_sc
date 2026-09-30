"use client"
import { useFormContext } from "react-hook-form"
import FoulRow from "../form_components/FoulRow"
import TimeoutsGrid from "../form_components/TimeoutsGrid"
import RosterTable from "../form_components/RosterTable"
import HccCells from "../form_components/HccCells"

export default function TeamForm(props) {
  const { register } = useFormContext()
  const group = `team${props.team}`
  const foulsPerPeriod = 4
  const label = `Team ${props.team}`

  return (
    <div className="w-full h-full font-sans text-sm font-bold text-gray-800 border border-r-black border-l-black border-t-0">
      <div className="flex items-end mb-0">
        <label className="mr-1 ml-1 whitespace-nowrap" style={{fontSize:18}}>{label}</label>
        <input
          type="text"
          className="flex-1 border-b-2 border-black bg-transparent focus:outline-none px-1 leading-tight mr-4"
          {...register(`${group}.name`)}
        />
      </div>

      

      <div className="flex gap-6">
        <div className="pb-1 pl-1.5">
          <p className=" text-left pl-1" style={{fontSize:18}}>Time-outs</p>
          <TimeoutsGrid group={group} />
        </div>

        <div>
          <p className=" pr-1 pl-1 text-center" style={{fontSize:18}}>Team fouls</p>
          <div className="flex items-center gap-2 h-5.5">
            <div>
              
              <span style={{fontSize:16}}> Q1</span>
            </div>
            
            <FoulRow group={group} period={1} count={foulsPerPeriod} color="text-red-500" />
            <span style={{fontSize:16}}> Q2</span>
            <FoulRow group={group} period={2} count={foulsPerPeriod} color="text-black" />
          </div>
          <div className="flex items-center gap-2 h-5.6">
            
            <div>
              
              <span style={{fontSize:16}}> Q3</span>
            </div>
            <FoulRow group={group} period={3} count={foulsPerPeriod}  color="text-red-500" />
            <span style={{fontSize:16}}> Q4</span>
            <FoulRow group={group} period={4} count={foulsPerPeriod}  color="text-black" />
          </div>
          <div className="flex items-center gap-2 ml-7">
            <span style={{fontSize:16}}>HCC</span>
            <HccCells name={`${group}.hcc`} />
          </div>
        </div>
      </div>
      <div>
        <RosterTable group={group}  />
      </div>
    </div>
  )
}