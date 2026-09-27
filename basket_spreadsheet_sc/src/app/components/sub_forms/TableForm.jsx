"use client"
import { useFormContext } from "react-hook-form";


const BLOCK_WIDTH = 340 
const LABEL_WIDTH = 170 


function Row({ label, name, register }) {
    return (
        <div className="flex items-baseline" style={{ height: 22 }}>
            <span
                className="font-bold text-[13px] leading-none shrink-0"
                style={{ width: LABEL_WIDTH }}
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
                <Row label="Scorekeeper" name="scorekeeper" register={register} />
                <Row label="Assistant Scorekeeper" name="assistantScorekeeper" register={register} />
                <Row label="Timekeeper" name="timekeeper" register={register} />
                <Row label={'24" operator'} name="operator24" register={register} />
            </div>

            <div className="border-t border-black dark:border-white" />

            <div className="flex flex-col p-2" style={{ gap: 2 }}>
                <Row label="Referee" name="referee" register={register} />
                <Row label="Umpire 1" name="umpire1" register={register} />
                <Row label="Umpire 2" name="umpire2" register={register} />
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
