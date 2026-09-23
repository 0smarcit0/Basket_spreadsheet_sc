"use client"
import { useFormContext, useController } from "react-hook-form"
import { useEffect, useState } from "react"

export default function TimeoutBox({ group, color, boxid }) {
  const { control } = useFormContext()
  const name = `${group}.timeouts.${boxid}`
  const { field } = useController({
    name,
    control,
    rules: {
      pattern: { value: /^([0-9]{0,2}|=)$/, message: "Solo números" },
    },
  })

  const [lockedColor, setLockedColor] = useState(null)

  useEffect(() => {
    const hasValue = field.value !== undefined && field.value !== "" && field.value !== null
    if (hasValue && lockedColor === null) {
      setLockedColor(field.value === "=" ? "text-black" : color)
    } else if (!hasValue && lockedColor !== null) {
      setLockedColor(null)
    }
    
  }, [field.value])

  const displayColor = lockedColor ?? color

  const handleChange = (e) => {
    let val = e.target.value
    if (val !== "=") {
      val = val.replace(/[^0-9]/g, "").slice(0, 2)
      if (val !== "" && Number(val) > 40) val = "40"
    }
    field.onChange(val === "" ? undefined : val)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={2}
      className={`w-8 h-8 border-2 border-black text-center bg-transparent
                  focus:outline-none focus:bg-yellow-50 leading-none ${displayColor}`}
      name={field.name}
      value={field.value ?? ""}
      onChange={handleChange}
      onBlur={field.onBlur}
      ref={field.ref}
    />
  )
}