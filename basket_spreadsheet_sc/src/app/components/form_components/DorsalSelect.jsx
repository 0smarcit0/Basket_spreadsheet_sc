"use client"
import { useFormContext, useController, useWatch } from "react-hook-form";
import { ROW_HEIGHT } from "./ScoreNumberCell";
import { useState, useEffect, useMemo } from "react";
export const SELECT_CELL_WIDTH = 40 // px

export default function DorsalSelect({ gname, players = [], color, handleChange }) {
    const { control } = useFormContext();
    const [lockedColor, setLockedColor] = useState(null)
    const name = `${gname}.dorsal`

    const { field } = useController({ name, control })
    const points = useWatch({ control, name: `${gname}.points` }) // solo esta celda

    useEffect(() => {
        const hasValue = field.value !== undefined && field.value !== "" && field.value !== null;
        if (hasValue && lockedColor === null) {
            setLockedColor(field.value === "=" ? "text-black" : color);
        } else if (!hasValue && lockedColor !== null) {
            setLockedColor(null);
        }
    }, [field.value, lockedColor, color]);

    const displayColor = lockedColor ?? color;

    // Ancho del nombre más largo, para alinear la columna de dorsales
    const nameWidth = useMemo(
        () => Math.max(0, ...players.map((p) => String(p.name ?? "").length)),
        [players]
    );

    const formatOption = (player) =>
        `${String(player.name ?? "").toUpperCase().padEnd(nameWidth, "\u00A0")}\u00A0\u00A0\u00A0${player.number}`;

    const hasValue = field.value !== undefined && field.value !== null && field.value !== "";

    return (
        <td
            className={"border border-black p-0 relative " + displayColor}
            style={{ width: SELECT_CELL_WIDTH, height: ROW_HEIGHT }}
        >
            <select
                className="block w-full h-full appearance-none border-0 rounded-none bg-transparent text-[11px] text-center cursor-pointer text-transparent focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                name={field.name}
                value={field.value || ""}
                ref={field.ref}
                onBlur={field.onBlur}
                onChange={(e) => {
                    const previousDorsal = field.value || ""; // antes de que cambie
                    field.onChange(e);
                    handleChange(name, e.target.value, previousDorsal);
                }}
            >
                <option value=""></option>
                {players.map((player) => (
                    <option
                        key={player.number}
                        value={player.number}
                        className="text-black bg-white font-mono"
                    >
                        {formatOption(player)}
                    </option>
                ))}
            </select>

            {hasValue && (
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px]">
                    {field.value}
                </span>
            )}

            {points === 3 && (
                <span className="pointer-events-none absolute inset-0 m-auto w-[22px] h-[22px] rounded-full border-2 border-current" />
            )}
        </td>
    )
}