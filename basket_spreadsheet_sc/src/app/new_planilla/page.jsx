"use client"
import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import Navbar from "../components/Navbar" // ajusta la ruta
import FormHeadInputs from "../components/sub_forms/FormHeadInputs";
import TeamForm from "../components/sub_forms/TeamForm";
import TableForm from "../components/sub_forms/TableForm";
import RunningScoreForm from "../components/sub_forms/RunningScoreForm";
import HalftimeWatcher from "../components/form_components/HalfTimeWatcher";
import ScoresForm from "../components/sub_forms/ScoreForm";
import { useMatchStore } from "../utils/store/matchStore";
import Link from "next/link"
import { ArrowLeft } from "lucide-react"


const SHEET_WIDTH = 1200
const SHEET_HEIGHT = 1600

const QUARTERS = [
    { id: 1, label: "1st" },
    { id: 2, label: "2nd" },
    { id: 3, label: "3rd" },
    { id: 4, label: "4th" },
    { id: 5, label: "OT" }
];

export default function FormPlanilla() {
    const methods = useForm();
    const gameEnded = useMatchStore((state) => state.gameEnded)
    const endGame = useMatchStore((state) => state.endGame)
    const quarter = useMatchStore((state) => state.quarter)
    const setQuarter = useMatchStore((state) => state.setQuarter)
    const teamAlastCell = useMatchStore((state) => state.numberCellNameA)
    const teamAscore = useMatchStore((state) => state.teamAcurrentScore)
    const teamBlastCell = useMatchStore((state) => state.numberCellNameB)
    const teamBscore = useMatchStore((state) => state.teamBcurrentScore)

    // Tema (quita este bloque si ya lo manejas en otro lugar)
    const [isDarkMode, setIsDarkMode] = useState(false)
    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains("dark"))
    }, [])
    const toggleTheme = () => {
        const next = !isDarkMode
        document.documentElement.classList.toggle("dark", next)
        setIsDarkMode(next)
    }

    const onSubmit = (data) => {
        alert(JSON.stringify(data))
    }

    const handleEndGame = () => {
        if (quarter === 0) {
            alert("El partido aún no ha comenzado.")
            return
        }
        if (window.confirm("¿Terminar el partido? Esta acción no se puede deshacer.")) {
            endGame()
        }
    }

    return (
        <div className="flex h-full w-full flex-col bg-gray-100 dark:bg-gray-900">
            <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

            <div className="flex-1 overflow-auto">
                {/* Barra de herramientas: fija arriba al hacer scroll */}
                <div className="sticky top-0 z-30 border-b border-gray-200 bg-gray-100/95 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
                    <div
                        className="mx-auto flex items-center justify-between gap-4"
                        style={{ width: SHEET_WIDTH }}
                    >
                        {/* Izquierda: acciones */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="flex w-fit items-center text-sm font-medium text-blue-500 transition-colors hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 sm:text-base"
                            >
                                <ArrowLeft size={16} className="mr-1" />
                                Inicio
                            </Link>

                            <span className="h-5 w-px bg-gray-300 dark:bg-gray-700" />

                            <button
                                type="submit"
                                form="planilla-form"
                                className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Submit
                            </button>
                            <button
                                type="button"
                                onClick={handleEndGame}
                                disabled={gameEnded}
                                className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-600"
                            >
                                {gameEnded ? "Partido terminado" : "Terminar partido"}
                            </button>
                        </div>

                        {/* Centro: marcador en vivo (datos de depuración, bórralos si no los necesitas) */}
                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
                            <span>
                                <b>A:</b> {teamAscore} <span className="opacity-60">({teamAlastCell || "—"})</span>
                            </span>
                            <span>
                                <b>B:</b> {teamBscore} <span className="opacity-60">({teamBlastCell || "—"})</span>
                            </span>
                        </div>

                        {/* Derecha: selector de cuarto */}
                        <div className="flex rounded-lg bg-gray-300 p-1 dark:bg-gray-700">
                            {QUARTERS.map((q) => (
                                <button
                                    key={q.id}
                                    type="button"
                                    onClick={() => setQuarter(q.id)}
                                    className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                                        quarter === q.id
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-600 hover:text-gray-800 dark:text-gray-300"
                                    }`}
                                >
                                    {q.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <FormProvider {...methods}>
                    <form
                        id="planilla-form"
                        onSubmit={methods.handleSubmit(onSubmit)}
                        style={{ width: SHEET_WIDTH, height: SHEET_HEIGHT }}
                        className="relative mx-auto my-4 bg-white p-4 shadow-md dark:bg-gray-950"
                    >
                        <HalftimeWatcher getValues={methods.getValues} groups={["teamA", "teamB"]} />
                        <div className="w-[1061px]">
                            <FormHeadInputs />
                        </div>

                        <div className="flex w-[1050px] flex-row items-start gap-[14px]">
                            <div className="flex w-[500px] shrink-0 flex-col">
                                <div className="flex h-[1018px] flex-col">
                                    <div className="h-[509px]">
                                        <TeamForm team="A" />
                                    </div>
                                    <div className="h-[509px]">
                                        <TeamForm team="B" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="h-[1018px] w-[547px] shrink-0">
                                    <RunningScoreForm />
                                </div>
                            </div>
                        </div>

                        <div className="flex w-[1061px] flex-row items-start">
                            <TableForm />
                            <ScoresForm />
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    )
}