"use client"
import { useFormContext, useController } from "react-hook-form"
import { useEffect, useState } from "react"
import { useMatchStore } from "../../utils/store/matchStore"
export default function FoulBox({ group, period, index, color }) {
  const quarter = useMatchStore((state) => state.quarter)
  const { control, setValue } = useFormContext()
  const name = `${group}.fouls.p${period}.${index}`
  const classname ='w-8 h-8 border-2 border-black flex items-center justify-center bg-transparent focus:outline-none '+color
  const [val, setVal] = useState("x")


  const { field } = useController({
    name,
    control,
    defaultValue: false,
  })
  useEffect(()=>{
    
    if(period<quarter && !field.value){
       setValue(name,!field.value)
       setVal("=")
    }
  }, [val, field,period, quarter, setVal])

  return (
    <button
      type="button"
      aria-pressed={field.value}
      onClick={() => field.onChange(!field.value)}
      className={classname}
    >
      {field.value && val}
    </button>
  )
}