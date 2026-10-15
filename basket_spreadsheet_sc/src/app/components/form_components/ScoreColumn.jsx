"use client"
import { useLayoutEffect, useRef, useState } from "react";
import ScoreRow from "./ScoreRow";
import { NUMBER_CELL_WIDTH, ROW_HEIGHT } from "./ScoreNumberCell";
import { SELECT_CELL_WIDTH } from "./DorsalSelect";
import { useMatchStore } from "../../utils/store/matchStore";

export default function ScoreColumn({ team, range, name = "runningScore", players = [] }) {
    const [from, to] = range;
    const values = Array.from({ length: to - from + 1 }, (_, i) => from + i);
    const columnWidth = NUMBER_CELL_WIDTH + SELECT_CELL_WIDTH;

    const finalRow = useMatchStore((s) => s.finalRow[team]);
    const hasDiagonal = finalRow !== null && finalRow >= from && finalRow < to;

    const wrapperRef = useRef(null);
    const bodyRef = useRef(null);
    const [diag, setDiag] = useState(null);

    useLayoutEffect(() => {
        if (!hasDiagonal) {
            setDiag(null);
            return;
        }
        const wrapperRect = wrapperRef.current.getBoundingClientRect();
        const rows = bodyRef.current.children;
        const finalRect = rows[finalRow - from].getBoundingClientRect();
        const lastRect = rows[rows.length - 1].getBoundingClientRect();
        setDiag({
            top: finalRect.bottom - wrapperRect.top,
            height: lastRect.bottom - finalRect.bottom,
        });
    }, [hasDiagonal, finalRow, from]);

    return (
        <div ref={wrapperRef} className="relative" style={{ width: columnWidth }}>
            <table className="border-collapse" style={{ width: columnWidth }}>
                <thead>
                    <tr>
                        <th
                            colSpan={2}
                            className="border border-black text-[11px] font-bold bg-gray-50 dark:bg-gray-900"
                            style={{ height: ROW_HEIGHT }}
                        >
                            {team}
                        </th>
                    </tr>
                </thead>
                <tbody ref={bodyRef}>
                    {values.map((value) => (
                        <ScoreRow
                            key={value}
                            team={team}
                            value={value}
                            players={players}
                            name={`${name}.${team}.${value}`}
                        />
                    ))}
                </tbody>
            </table>

            {diag && (
                <svg
                    className="pointer-events-none absolute left-0"
                    style={{ top: diag.top, width: columnWidth, height: diag.height }}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    <line
                        x1="0" y1="0" x2="100" y2="100"
                        stroke="#000000"
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            )}
        </div>
    );
}