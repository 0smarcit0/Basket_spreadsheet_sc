"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import PlayerRow from "./PlayerRow";
import CoachFoulsCells from "./CoachFoulCells";
import { useFormContext } from "react-hook-form";
import { useMatchStore } from "../../utils/store/matchStore";

const ROWS = Array.from({ length: 12 }, (_, i) => i + 4);
const FIRST_FOUL_CELL = 4;
const LAST_FOUL_CELL = 8;

export default function RosterTable({ group }) {
  const { register, getValues } = useFormContext();
  const team = group === "teamA" ? "A" : "B";
  const matchStarted = useMatchStore((s) => s.quarter > 0 || !!s.forfeit);
  const isAbsent = useMatchStore((s) => !!s.forfeit?.absent?.[team]);
  const halftimeCaptured = useMatchStore((s) => s.halftimeCaptured);

  const wrapperRef = useRef(null);
  const tbodyRef = useRef(null);

  const computeLastFilledIndex = () => {
    const players = getValues(`${group}.players`) || [];
    let last = -1;
    players.forEach((p, i) => {
      const hasName = String(p?.name ?? "").trim() !== "";
      const hasNumber = String(p?.number ?? "").trim() !== "";
      if (hasName || hasNumber) last = i;
    });
    return last;
  };

  // null = partido sin comenzar. Si ya comenzó (planilla cargada), se calcula de inmediato.
  const [lastFilledIndex, setLastFilledIndex] = useState(() =>
    matchStarted ? computeLastFilledIndex() : null,
  );
  const [line, setLine] = useState(null);

  useEffect(() => {
    setLastFilledIndex(matchStarted ? computeLastFilledIndex() : null);
  }, [matchStarted]);

  // Mide el DOM real y arma la polilínea: horizontal + diagonal
  useLayoutEffect(() => {
    const hasEmptyRows =
      !isAbsent &&
      lastFilledIndex !== null &&
      lastFilledIndex < ROWS.length - 1;
    if (!hasEmptyRows) {
      setLine(null);
      return;
    }

    const measure = () => {
      const wrapper = wrapperRef.current;
      const rows = tbodyRef.current?.rows;
      if (!wrapper || !rows) return;

      const lineRow = rows[lastFilledIndex + 1];
      const lastRow = rows[ROWS.length - 1];
      if (!lineRow || !lastRow) return;

      const w = wrapper.getBoundingClientRect();
      const first = lineRow.cells[0].getBoundingClientRect();
      const firstFoul = lineRow.cells[FIRST_FOUL_CELL].getBoundingClientRect();
      const lastFoul = lastRow.cells[LAST_FOUL_CELL].getBoundingClientRect();

      const y = first.top + first.height / 2 - w.top;
      setLine({
        width: w.width,
        height: w.height,
        points: [
          `${first.left - w.left},${y}`, // borde izquierdo de la fila
          `${firstFoul.left - w.left},${y}`, // inicio de las fouls
          `${lastFoul.right - w.left},${lastFoul.bottom - w.top}`, // esquina inferior derecha
        ].join(" "),
      });
    };

    measure();
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(wrapperRef.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [lastFilledIndex, halftimeCaptured, isAbsent]);
  return (
    <div ref={wrapperRef} className="relative">
      <table className="w-full border-collapse border border-black text-xs">
        <thead>
          <tr>
            <th rowSpan={2} className="border border-black w-10 px-1 py-0.5">
              Licence no.
            </th>
            <th
              rowSpan={2}
              className="border border-black px-1 py-0.5 text-center"
            >
              Players
            </th>
            <th rowSpan={2} className="border border-black w-10 px-1 py-0.5">
              No.
            </th>
            <th rowSpan={2} className="border border-black w-12 px-1 py-0.5">
              Player in
            </th>
            <th
              colSpan={5}
              className="border border-black border-b-0 px-1 py-0.5"
            >
              Fouls
            </th>
          </tr>
          <tr>
            {[1, 2, 3, 4, 5].map((n) => (
              <th key={n} className="w-6 px-1 py-0.5">
                {n}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={tbodyRef}>
          {ROWS.map((rowNumber, index) => (
            <PlayerRow
              key={rowNumber}
              group={group}
              index={index}
              totalRows={ROWS.length}
              disabled={
                isAbsent ||
                (lastFilledIndex !== null && index > lastFilledIndex)
              }
            />
          ))}
          <tr>
            <td
              colSpan={6}
              className="border border-black text-left font-bold p-0"
            >
              <div className="flex items-stretch h-[24px]">
                <label className="mr-1 ml-1 whitespace-nowrap flex items-center shrink-0 w-[115px]">
                  Head coach
                </label>
                <input
                  type="text"
                  className="w-[40px] shrink-0 m-0 py-0 px-1 bg-transparent
                border-0 border-x border-black
                focus:outline-none leading-tight"
                  {...register(`${group}.coachAditionalInput`)}
                />
                <input
                  type="text"
                  className="flex-1 min-w-0 m-0 py-0 px-1 bg-transparent
                   border-0 focus:outline-none leading-tight"
                  {...register(`${group}.coachName`)}
                />
              </div>
            </td>
            <CoachFoulsCells group={group} role="coach" />
          </tr>
          <tr>
            <td
              colSpan={6}
              className="border border-black text-left font-bold p-0"
            >
              <div className="flex items-stretch h-[24px]">
                <label className="mr-1 ml-1 whitespace-nowrap flex items-center shrink-0 w-[115px]">
                  First assistant Coach
                </label>

                <input
                  type="text"
                  className="w-[40px] shrink-0 m-0 py-0 px-1 bg-transparent
                border-0 border-x border-black
                focus:outline-none leading-tight"
                  {...register(`${group}.assistantCoachAditionalInput`)}
                />

                <input
                  type="text"
                  className="flex-1 min-w-0 m-0 py-0 px-1 bg-transparent
                   border-0 focus:outline-none leading-tight"
                  {...register(`${group}.assistantCoachName`)}
                />
              </div>
            </td>
            <CoachFoulsCells group={group} role="assistantCoach" />
          </tr>
        </tbody>
      </table>
      {isAbsent && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
          <span className="-rotate-[30deg] select-none text-6xl font-bold tracking-widest text-blue-700">
            AUSENTE
          </span>
        </div>
      )}
      {line && (
        <svg
          className="pointer-events-none absolute left-0 top-0 z-10 overflow-visible"
          width={line.width}
          height={line.height}
        >
          <polyline
            points={line.points}
            fill="none"
            stroke="black"
            strokeWidth="2"
            strokeLinejoin="miter"
          />
        </svg>
      )}
    </div>
  );
}
