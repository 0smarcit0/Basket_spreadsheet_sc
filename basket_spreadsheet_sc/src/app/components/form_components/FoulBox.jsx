"use client"
import { useFormContext, useController } from "react-hook-form"
import {X} from "lucide-react"
export default function FoulBox({ group, period, index }) {
  const { control } = useFormContext()
  const name = `${group}.fouls.p${period}.${index}`

  const { field } = useController({
    name,
    control,
    defaultValue: false,
  })

  return (
    <button
      type="button"
      aria-pressed={field.value}
      onClick={() => field.onChange(!field.value)}
      className="w-8 h-8 border-2 border-black flex items-center justify-center
                 bg-transparent focus:outline-none"
    >
      {field.value && <X className="w-6 h-6" strokeWidth={2.5} />}
    </button>
  )
}