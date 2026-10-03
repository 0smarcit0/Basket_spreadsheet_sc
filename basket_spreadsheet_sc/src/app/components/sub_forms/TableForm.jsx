"use client"
import { useFormContext } from "react-hook-form"

const FONT = "'Arial Narrow', 'Liberation Sans Narrow', Arial, sans-serif"

function Row({ label, name, register, labelWidth }) {
  return (
    <div className="flex flex-1 items-end gap-1">
      <span
        className="shrink-0 whitespace-nowrap text-[13px] font-bold leading-none"
        style={{ width: labelWidth }}
      >
        {label}
      </span>
      <input
        type="text"
        {...register(name)}
        className="h-[18px] min-w-0 flex-1 border-0 border-b border-black bg-transparent p-0 px-1 text-[13px] leading-none focus:outline-none"
      />
    </div>
  )
}

export default function TableForm() {
  const { register } = useFormContext()

  return (
    <div
      className="w-[500px] shrink-0 border border-black text-black"
      style={{ fontFamily: FONT }}
    >
      {/* SECCIÓN 1 (misma altura que Scores) */}
      <div className="flex h-[126px] flex-col justify-between px-2 py-[10px]">
        <Row label="Scorer" name="scorekeeper" register={register} labelWidth={150} />
        <Row label="Assistant scorer" name="assistantScorekeeper" register={register} labelWidth={150} />
        <Row label="Timer" name="timekeeper" register={register} labelWidth={150} />
        <Row label="Shot clock operator" name="operator24" register={register} labelWidth={150} />
      </div>

      {/* SECCIÓN 2 (misma altura que Final Score) */}
      <div className="flex h-[58px] flex-col justify-center gap-[10px] border-t border-black px-2">
        <div className="flex h-[18px]">
          <Row label="Crew Chief" name="referee" register={register} labelWidth={70} />
        </div>
        <div className="flex h-[18px] gap-6">
          <Row label="Umpire 1" name="umpire1" register={register} labelWidth={58} />
          <Row label="Umpire 2" name="umpire2" register={register} labelWidth={58} />
        </div>
      </div>

      {/* SECCIÓN 3 (misma altura que Game ended at) */}
      <div className="flex h-[36px] items-end border-t border-black px-2 pb-[6px]">
        <div className="flex h-[18px] w-full">
          <Row
            label="Captain's signature in case of protest"
            name="captainSignature"
            register={register}
            labelWidth={215}
          />
        </div>
      </div>
    </div>
  )
}