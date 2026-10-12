"use client"
import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import FormHeadInputs from "../components/sub_forms/FormHeadInputs";
import TeamForm from "../components/sub_forms/TeamForm";
import TableForm from "../components/sub_forms/TableForm";
import RunningScoreForm from "../components/sub_forms/RunningScoreForm";
import HalftimeWatcher from "../components/form_components/HalfTimeWatcher";
import ScoresForm from "../components/sub_forms/ScoreForm";
import { useMatchStore } from "../utils/store/matchStore";
import Link from "next/link"
import { generateHalftimeReport } from "../utils/halfTimeReport" // ajusta la ruta
import { ArrowLeft } from "lucide-react"
import Modal from "../components/Modal"

const SHEET_WIDTH = 1120
const SHEET_HEIGHT = 1375

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

    const [modalTitle, setModalTitle] = useState("")
    const [modalMessage, setModalMessage] = useState("")
    const [modalFooter, setModalFooter] = useState(<></>)
   

    const [open, setOpen] = useState(false)
    
  
    const onSubmit = (data) => {
        alert(JSON.stringify(data))
    }

    const handleEndGame = () => {
        if (quarter === 0) {
            setModalTitle("Advertencia")
            setModalMessage("El partido aún no ha comenzado.")
            setModalFooter(<></>)
            setOpen(true)
            return
        }
        setModalTitle("Confirmación de finalización del partido")
        setModalMessage("¿Está seguro que desea finalizar el partido? Una vez finalizado, no podrá realizar más cambios.")
        setModalFooter((<button
                            type="button"
                            onClick={() => {endGame(); setOpen(false)}}
                            className="rounded-md px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-800"
                        >
                            Proceder
                        </button>))
        setOpen(true)
        
    }

    const handleQuarterChange = (newQuarter) => {
        if(quarter === 0 && newQuarter === 1) {
            setModalTitle("Confirmación de inicio de partido")
            setModalMessage("¿Está seguro que desea comenzar el partido? Una vez iniciado, no podrá agregar más jugadores.")
            setModalFooter((<button
                                type="button"
                                onClick={() => {setQuarter(1); setOpen(false)}}
                                className="rounded-md px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-800"
                            >
                                Proceder
                            </button>))
            setOpen(true)
        }else if(newQuarter > quarter + 1){
            setModalTitle("Advertencia")
            setModalMessage("No puede saltar cuartos. Debe avanzar de uno en uno.")
            setOpen(true)
        }
        else{
            setQuarter(newQuarter)
        }
        
    }

    return (
        <div className="flex h-full w-full flex-col bg-gray-100 dark:bg-gray-900">
            

            <div className="flex-1 overflow-auto">
                <div className=" top-0 z-30 border-b border-gray-200 bg-gray-100/95 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
                    <div
                        className="mx-auto flex items-center justify-between gap-4"
                        style={{ width: SHEET_WIDTH }}
                    >
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
                            <button
                                type="button"
                                onClick={() => generateHalftimeReport(methods.getValues())}
                                disabled={quarter <= 2}
                                className="cursor-pointer rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Reporte mitad
                            </button>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
                            <span>
                                <b>A:</b> {teamAscore} <span className="opacity-60">({teamAlastCell || "—"})</span>
                            </span>
                            <span>
                                <b>B:</b> {teamBscore} <span className="opacity-60">({teamBlastCell || "—"})</span>
                            </span>
                        </div>

                        <div className="flex rounded-lg bg-gray-300 p-1 dark:bg-gray-700">
                            {QUARTERS.map((q) => {
                                const isLocked = q.id < quarter || gameEnded
                                const isActive = quarter === q.id

                                return (
                                    <button
                                        key={q.id}
                                        type="button"
                                        disabled={isLocked}
                                        onClick={() => handleQuarterChange(q.id)}
                                        className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                                            isActive
                                            ? "bg-white text-gray-900 shadow-sm"
                                            : "text-gray-600 hover:text-gray-800 dark:text-gray-300"
                                            } ${
                                            isLocked && !isActive
                                            ? "cursor-not-allowed opacity-40 hover:text-gray-600"
                                            : ""
                                        }`}
                                    >
                                        {q.label}
                                    </button>
                                )
                            })}
                            
                        </div>
                        {
                            open &&(
                                <Modal open 
                                    onClose ={() => setOpen(false)} 
                                    title={modalTitle}
                                    size="sm"
                                    footer={modalFooter}
                                    >
                                        <p>{modalMessage}</p>
                                    </Modal>
                                )
                        }
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
                        <div className="w-[1087px]">
                            <FormHeadInputs />
                        </div>

                        <div className="flex w-[1089px] flex-row items-start ">
                            <div className="flex w-[514px] shrink-0 flex-col">
                                <div className="flex h-[1018px] flex-col">
                                    <div className="min-h-0 flex-1">
                                        <TeamForm team="A" />
                                    </div>
                                    <div className="min-h-0 flex-1">
                                        <TeamForm team="B" />
                                    </div>
                                </div>
                            </div>
                            <div className="w-7 shrink-0" aria-hidden="true" />
                            <div>
                                <div className="h-[1018px] w-[545px] shrink-0">
                                    <RunningScoreForm />
                                </div>
                            </div>
                        </div>

                        <div className="flex w-[1088px] flex-row items-start">
                            <TableForm />
                            <ScoresForm />
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    )
}