"use client"
import { useFormContext } from "react-hook-form"

export default function TimeoutBox({ group, index }) {
  const { register } = useFormContext()
  const name = `${group}.timeouts.${index}`

  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={2}
      className="w-8 h-8 border-2 border-black text-center bg-transparent
                 focus:outline-none focus:bg-yellow-50 leading-none"
      {...register(name, {
        min: { value: 0, message: "Mínimo 0" },
        max: { value: 40, message: "Máximo 40" },
        pattern: { value: /^[0-9]{0,2}$/, message: "Solo números" },
        setValueAs: (v) => (v === "" ? undefined : Number(v)),
      })}
      onChange={(e) => {
        let val = e.target.value.replace(/[^0-9]/g, "").slice(0, 2)
        if (val !== "" && Number(val) > 40) val = "40"
        e.target.value = val
      }}
    />
  )
}