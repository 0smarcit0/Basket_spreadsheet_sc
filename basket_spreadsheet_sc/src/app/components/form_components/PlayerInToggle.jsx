"use client"
import { useController } from "react-hook-form"
import { useState, useRef, useEffect } from "react"
import { X, Circle } from "lucide-react"
import { useMatchStore } from "../../utils/store/matchStore"

// Reglas de color por cuarto
function getColorForQuarter(quarter) {
  if (quarter === 1 || quarter === 3) return "red"
  // 2, 4, overtime (y cualquier otro caso) => negro
  return "black"
}

const COLOR_CLASSES = {
  red: "text-red-600",
  black: "text-black",
}

// Parsea el valor guardado: "" | "starter:red" | "sub:black" | (legacy) "starter" | "sub"
function parseValue(value) {
  if (!value) return { type: "", color: null }
  const [type, color] = value.split(":")
  return { type, color: color || "black" } // fallback para valores viejos sin color
}

function Icon({ type, color }) {
  if (!type) return null
  const colorClass = COLOR_CLASSES[color] || "text-black"

  if (type === "starter") {
    return (
      <span className="relative w-4 h-4 flex items-center justify-center">
        <Circle className="absolute w-4 h-4 text-black" strokeWidth={2} />
        <X className={`w-2.5 h-2.5 ${colorClass}`} strokeWidth={3} />
      </span>
    )
  }

  if (type === "sub") {
    return <X className={`w-3.5 h-3.5 ${colorClass}`} strokeWidth={3} />
  }

  return null
}

export default function PlayerInToggle({ group, index }) {
  const quarter = useMatchStore((state) => state.quarter)
  const name = `${group}.players.${index}.playerIn`
  const { field } = useController({ name, defaultValue: "" })
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const { type: currentType, color: currentColor } = parseValue(field.value)

  const liveColor = getColorForQuarter(quarter)

  const handleSelect = (optionType) => {
    if (optionType === "") {
      field.onChange("")
    } else {
      field.onChange(`${optionType}:${liveColor}`)
    }
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative w-6 h-6 mx-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-6 h-6 flex items-center justify-center"
        title="Selecciona: vacío / titular / entra por cambio"
      >
        <Icon type={currentType} color={currentColor} />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-300 rounded shadow-md z-10 flex flex-col py-1">
          <button
            type="button"
            onClick={() => handleSelect("")}
            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100"
          >
            {/* opción vacía */}
          </button>
          <button
            type="button"
            onClick={() => handleSelect("starter")}
            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100"
          >
            <Icon type="starter" color={liveColor} />
          </button>
          <button
            type="button"
            onClick={() => handleSelect("sub")}
            className="w-7 h-7 flex items-center justify-center hover:bg-gray-100"
          >
            <Icon type="sub" color={liveColor} />
          </button>
        </div>
      )}
    </div>
  )
}