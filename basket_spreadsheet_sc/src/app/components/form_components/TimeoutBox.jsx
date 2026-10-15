"use client"
import { useFormContext, useController } from "react-hook-form"
import { useEffect, useState } from "react"

export default function TimeoutBox({ group, color, boxid, isVoid, disabled }) {
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

  // El color se fija al escribir y se libera si se borra el valor
  useEffect(() => {
    const hasValue = field.value !== undefined && field.value !== "" && field.value !== null
    if (hasValue && lockedColor === null) {
      setLockedColor(color)
    } else if (!hasValue && lockedColor !== null) {
      setLockedColor(null)
    }
  }, [field.value])

  const handleChange = (e) => {
    let val = e.target.value
    if (val !== "") {
      val = val.replace(/[^0-9]/g, "").slice(0, 2)
      if (Number(val) > 40) val = "1"
    }
    field.onChange(val === "" ? undefined : val)
  }

  return (
    <div className="relative -mr-0.5 -mb-0.5 h-6 w-6.5 focus-within:z-10">
      <input
        type="text"
        inputMode="numeric"
        maxLength={2}
        className={`box-border h-full w-full border-2 border-black bg-transparent text-center leading-none
                    focus:bg-yellow-50 focus:outline-none ${lockedColor ?? color}`}
        name={field.name}
        value={field.value ?? ""}
        onChange={handleChange}
        onBlur={field.onBlur}
        ref={field.ref}
        disabled={disabled}
      />

      {isVoid && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full text-black"
          viewBox="0 0 24 24"
          preserveAspectRatio="none"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="butt"
        >
          <line x1="0" y1="8" x2="24" y2="8" vectorEffect="non-scaling-stroke" />
          <line x1="0" y1="16" x2="24" y2="16" vectorEffect="non-scaling-stroke" />
        </svg>
      )}
    </div>
  )
}