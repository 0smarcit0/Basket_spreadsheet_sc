"use client"
import { useFormContext } from "react-hook-form";


const BLOCK_WIDTH = 340 


function Row({ label, name, register, label_width}) {
    return (
        <div className="flex items-baseline gap-0.5" style={{ height: 22 }}>
            <span
                className="font-bold text-[13px] leading-none shrink-0"
                style={{ width: label_width }}
            >
                {label}
            </span>
            <input
                type="text"
                {...register(name)}
                className="
                    flex-1
                    bg-transparent
                    border-0 border-b border-black
                    dark:border-white
                    text-[13px]
                    leading-none
                    px-1
                    focus:outline-none
                "
                style={{ height: 20 }}
            />
        </div>
    )
}

export default function TableForm() {
    const { register } = useFormContext();

    return (
        <div
            className="w-full border border-black dark:border-white "
        >
            <div className="flex flex-col p-2" style={{ gap: 2 }}>
                <Row label="Scorer" name="scorekeeper" register={register} label_width={170}/>
                <Row label="Assistant Scorer" name="assistantScorekeeper" register={register} label_width={170}  />
                <Row label="Timer" name="timekeeper" register={register} label_width={170} />
                <Row label="Shot clock operator" name="operator24" register={register} label_width={170} />
            </div>

            <div className="border-t border-black dark:border-white" />

            <div className="flex flex-col p-2" style={{ gap: 2 }}>
                <Row label="Crew Chief" name="referee" register={register}  label_width={70}/>
                <div className="flex flex-row gap-6">
                    <Row label="Umpire 1" name="umpire1" register={register} label_width={70}/>
                    <Row label="Umpire 2" name="umpire2" register={register} label_width={70}/>
                </div>
                
            </div>

            <div className="border-t border-black dark:border-white" />

            <div className="p-2">
                <div className="flex items-baseline" style={{ height: 22 }}>
                    <span className="font-bold text-[13px] leading-none shrink-0 whitespace-nowrap">
                        Captain&apos;s signature in case of protest
                    </span>
                    <input
                        type="text"
                        {...register("captainSignature")}
                        className="
                            flex-1
                            bg-transparent
                            border-0 border-b border-black
                            dark:border-white
                            text-[13px]
                            leading-none
                            px-1
                            ml-1
                            focus:outline-none
                        "
                        style={{ height: 20 }}
                    />
                </div>
            </div>
        </div>
    )
}
