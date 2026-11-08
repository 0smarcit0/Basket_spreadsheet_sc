"use client"
import { useFormContext, useWatch } from "react-hook-form";
import { colorForPeriod } from "./ScoreRow";
import { useMatchStore } from "../../utils/store/matchStore"

export const NUMBER_CELL_WIDTH = 28 // px
export const ROW_HEIGHT = 24 // px

export default function ScoreNumberCell({ name, value, endMark, overtimeMark = false, isFinal = false, onModify }) {
    const { control } = useFormContext();
    const gameEnded = useMatchStore((s) => s.gameEnded)
    const [points, period] = useWatch({
        control,
        name: [`${name}.points`, `${name}.period`],
    });
    const clickable = !!points && !gameEnded && !!onModify


    const markColor = colorForPeriod(period);

    return (
        <td
            className={`border border-black p-0 text-center relative ${clickable ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" : ""}`}
            style={{ width: NUMBER_CELL_WIDTH, height: ROW_HEIGHT }}
            onClick={clickable ? onModify : undefined}
        >
            <span className="pointer-events-none flex items-center justify-center w-full h-full text-[11px] leading-none text-black">
                {value}
            </span>

            {/* 2 y 3 puntos: "/" sobre el número */}
            {(points === 2 || points === 3) && (
                <span className={`pointer-events-none absolute inset-0 flex items-center justify-center text-[22px] font-light leading-none ${markColor}`}>
                    /
                </span>
            )}

            {points === 1 && (
                <span className={`pointer-events-none absolute inset-0 flex items-center justify-center ${markColor}`}>
                    <span className="block w-[9px] h-[9px] rounded-full bg-current" />
                </span>
            )}
            {overtimeMark || isFinal ? (
                <span className="pointer-events-none absolute inset-0 m-auto w-[20px] h-[20px] rounded-full border-[3px] border-black" />
            ) : endMark !== undefined && (
                <span className={`pointer-events-none absolute inset-0 m-auto w-[20px] h-[20px] rounded-full border-2 border-current ${colorForPeriod(endMark)}`} />
            )}
        </td>
    )
}