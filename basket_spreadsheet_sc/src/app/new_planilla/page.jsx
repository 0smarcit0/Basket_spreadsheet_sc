"use client"
import { useState,useEffect,useRef } from "react"
import { useForm, FormProvider } from "react-hook-form"
import FormHeadInputs from "../components/sub_forms/FormHeadInputs";
import TeamForm from "../components/sub_forms/TeamForm";
import TableForm from "../components/sub_forms/TableForm";
import RunningScoreForm from "../components/sub_forms/RunningScoreForm";
import HalftimeWatcher from "../components/form_components/HalfTimeWatcher";
import ScoresForm from "../components/sub_forms/ScoreForm";
import { useMatchStore } from "../utils/store/matchStore";
import Link from "next/link"
import { generateHalftimeReport } from "../utils/halfTimeReport" 
import { generateGameReport } from "../utils/gameReport"
import { ArrowLeft, ChevronDown } from "lucide-react"
import Modal from "../components/Modal"
import SheetBanner, {BANNER_HEIGHT} from "../components/sub_forms/SheetBanner"
import {generatePlanillaFile,downloadFile,sharePlanillaFile,isMobileOrTablet,} from "../utils/print_planilla"
const SHEET_WIDTH = 1120
const SHEET_HEIGHT = 1375 + BANNER_HEIGHT

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
    const [generating, setGenerating] = useState(false)
    const [pendingFile, setPendingFile] = useState(null)
    const [open, setOpen] = useState(false)
    const [reportMenuOpen, setReportMenuOpen] = useState(false)
    const reportMenuRef = useRef(null)
    const prevGameEnded = useRef(gameEnded)

    const generateAndDeliver = async () => {
        if (generating) return
        setGenerating(true)
        try {
            const file = await generatePlanillaFile("planilla-form", `planilla-${Date.now()}.png`)

            if (isMobileOrTablet()) {
                setPendingFile(file) // se comparte con un toque en el modal
            } else {
                downloadFile(file)
            }
        } catch (err) {
            console.error(err)
            setModalTitle("Error")
            setModalMessage("No se pudo generar la imagen de la planilla.")
            setModalFooter(<></>)
            setOpen(true)
        } finally {
            setGenerating(false)
        }
    }

    const handlePrint = () => generateAndDeliver()

    useEffect(() => {
        const justEnded = !prevGameEnded.current && gameEnded
        prevGameEnded.current = gameEnded

        if (!justEnded) return

   
        const timer = setTimeout(() => {
            generateAndDeliver()
        }, 400)

        return () => clearTimeout(timer)
    }, [gameEnded])


    const onSubmit = (data) => {
        alert(JSON.stringify(data))
    }
    const handleFinalReport = (team) => {
      if (gameEnded){
        setReportMenuOpen(false)
        generateGameReport(methods.getValues(), team)
      }
      
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
    useEffect(() => {
        if (!reportMenuOpen) return

        const onMouseDown = (e) => {
            if (!reportMenuRef.current?.contains(e.target)) setReportMenuOpen(false)
        }
        const onKeyDown = (e) => {
            if (e.key === "Escape") setReportMenuOpen(false)
        }

        document.addEventListener("mousedown", onMouseDown)
        document.addEventListener("keydown", onKeyDown)
        return () => {
            document.removeEventListener("mousedown", onMouseDown)
            document.removeEventListener("keydown", onKeyDown)
        }
    }, [reportMenuOpen])

const handleHalftimeReport = (team) => {
    setReportMenuOpen(false)
    generateHalftimeReport(methods.getValues(), team)
}
    return (
      <div className="flex h-full w-full flex-col bg-gray-100 dark:bg-gray-900">
        <div className="flex-1 overflow-auto">
          <div className="relative z-30 border-b border-gray-200 bg-gray-100/95 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
            <div
              className="mx-auto flex items-center justify-between gap-4"
              style={{ width: SHEET_WIDTH }}
            >
              <div className="  flex items-center gap-3 z-20">
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
                  onClick={handlePrint}
                  disabled={generating}
                  className="cursor-pointer rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generating ? "Generando..." : "Imprimir planilla"}
                </button>
                <button
                  type="button"
                  onClick={handleEndGame}
                  disabled={gameEnded}
                  className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red-600"
                >
                  {gameEnded ? "Partido terminado" : "Terminar partido"}
                </button>
                <div ref={reportMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setReportMenuOpen((v) => !v)}
                    aria-haspopup="menu"
                    aria-expanded={reportMenuOpen}
                    className="flex cursor-pointer items-center gap-1 rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Reportes
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${reportMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {reportMenuOpen && (
                    <div
                      role="menu"
                      className="absolute left-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        disabled={quarter <= 2}
                        onClick={() => handleHalftimeReport("A")}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-100 dark:hover:bg-gray-700"
                      >
                        Reporte mitad equipo A
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        disabled={quarter <= 2}
                        onClick={() => handleHalftimeReport("B")}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:text-gray-100 dark:hover:bg-gray-700"
                      >
                        Reporte mitad equipo B
                      </button>

                      <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => handleFinalReport("A")}
                        disabled={!gameEnded}
                        className="block w-full  px-4 py-2 text-left text-sm text-gray-800 disabled:opacity-40 dark:text-gray-100"
                      >
                        Reporte final equipo A
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!gameEnded}
                        onClick={() => handleFinalReport("B")}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-800 disabled:opacity-40  dark:text-gray-100"
                      >
                        Reporte final equipo B
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
                <span>
                  <b>A:</b> {teamAscore}{" "}
                  <span className="opacity-60">({teamAlastCell || "—"})</span>
                </span>
                <span>
                  <b>B:</b> {teamBscore}{" "}
                  <span className="opacity-60">({teamBlastCell || "—"})</span>
                </span>
              </div>

              <div className="flex rounded-lg bg-gray-300 p-1 dark:bg-gray-700">
                {QUARTERS.map((q) => {
                  const isLocked = q.id < quarter || gameEnded;
                  const isActive = quarter === q.id;

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
                  );
                })}
              </div>
              {open && (
                <Modal
                  open
                  onClose={() => setOpen(false)}
                  title={modalTitle}
                  size="sm"
                  footer={modalFooter}
                >
                  <p>{modalMessage}</p>
                </Modal>
              )}
            </div>
          </div>

          <FormProvider {...methods}>
            <form
              id="planilla-form"
              onSubmit={methods.handleSubmit(onSubmit)}
              style={{ width: SHEET_WIDTH, height: SHEET_HEIGHT }}
              className="relative mx-auto my-4 bg-white p-4 shadow-md dark:bg-gray-950 z-0"
            >
              <HalftimeWatcher
                getValues={methods.getValues}
                groups={["teamA", "teamB"]}
              />
              <div className="w-[1087px] mb-2">
                <SheetBanner />
              </div>
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
    );
}