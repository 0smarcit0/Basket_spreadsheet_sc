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
import { useRouter } from "next/navigation"
import { generateFinalMatchReportFile } from "../utils/gameReport"
import { ArrowLeft, ChevronDown } from "lucide-react"
import Modal from "../components/Modal"
import SheetBanner, {BANNER_HEIGHT} from "../components/sub_forms/SheetBanner"
import {generatePlanillaFile,downloadFile,sharePlanillaFile,isMobileOrTablet,} from "../utils/print_planilla"
import { saveSheet, loadSheet } from "../utils/saveSheet"
const SHEET_WIDTH = 1120
const SHEET_HEIGHT = 1375 + BANNER_HEIGHT

const QUARTERS = [
    { id: 1, label: "1st" },
    { id: 2, label: "2nd" },
    { id: 3, label: "3rd" },
    { id: 4, label: "4th" },
    { id: 5, label: "OT" }
];
const FORFEIT_OPTIONS = [
  { id: "A", label: "Inasistencia del equipo A" },
  { id: "B", label: "Inasistencia del equipo B" },
  { id: "both", label: "Inasistencia de ambos equipos" },
]

const MIN_STARTERS = 5
export default function FormPlanilla({initialMode="new"}) {
    const methods = useForm();
    const gameEnded = useMatchStore((state) => state.gameEnded)
    const endGame = useMatchStore((state) => state.endGame)
    const quarter = useMatchStore((state) => state.quarter)
    const setQuarter = useMatchStore((state) => state.setQuarter)
    const teamAlastCell = useMatchStore((state) => state.numberCellNameA)
    const teamAscore = useMatchStore((state) => state.teamAcurrentScore)
    const teamBlastCell = useMatchStore((state) => state.numberCellNameB)
    const teamBscore = useMatchStore((state) => state.teamBcurrentScore)
    const prevGameEnded = useRef(gameEnded)
    const [ready, setReady] = useState(false)
    const [modalTitle, setModalTitle] = useState("")
    const [modalMessage, setModalMessage] = useState("")
    const [modalFooter, setModalFooter] = useState(<></>)
    const [generating, setGenerating] = useState(false)
    const [pendingFile, setPendingFile] = useState(null)
    const [open, setOpen] = useState(false)
    const [generatingReport, setGeneratingReport] = useState(false)
    const endByForfeit = useMatchStore((state) => state.endByForfeit)
    const [forfeitMenuOpen, setForfeitMenuOpen] = useState(false)
    const forfeitMenuRef = useRef(null)
    const router = useRouter()

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
    // Debe ejecutarse directo desde el onClick, sin await previo (requisito de navigator.share)
    const handleSharePending = () => {
      if (pendingFile) sharePlanillaFile(pendingFile)
    }

    const handleDownloadPending = () => {
      if (pendingFile) downloadFile(pendingFile)
    }
    useEffect(() => {
        const justEnded = !prevGameEnded.current && gameEnded
        prevGameEnded.current = gameEnded

        if (!justEnded) return

   
        const timer = setTimeout(() => {
            generateAndDeliver()
        }, 400)

        return () => clearTimeout(timer)
    }, [gameEnded])


    const doSave = (data) => {
      try {
        console.log(saveSheet(data, useMatchStore.getState()));
        setModalTitle("Planilla guardada");
        setModalMessage(
          "La información de la planilla se guardó correctamente.",
        );
        setModalFooter(<></>);
      } catch (err) {
        console.error(err);
        setModalTitle("Error");
        setModalMessage("No se pudo guardar la información de la planilla.");
        setModalFooter(<></>);
      }
      setOpen(true);
    };

    const onSubmit = (data) => doSave(data);

    const onInvalid = (errors) => {
      console.log("Errores de validación (se guardó igualmente):", errors);
      doSave(methods.getValues());
    };

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


    //TODO fix showmodal on everything
    const showModal = (title, message, footer = <></>) => {
      setModalTitle(title);
      setModalMessage(message);
      setModalFooter(footer);
      setOpen(true);
    };
    const goHome = () => {
      setOpen(false);
      router.push("/");
    };

    const saveAndGoHome = () => {
      try {
        // getValues evita la validación: se guarda igual que cuando falla onInvalid
        saveSheet(methods.getValues(), useMatchStore.getState());
      } catch (err) {
        console.error(err);
        showModal(
          "Error",
          "No se pudo guardar la información de la planilla. Se permanece en la planilla.",
        );
        return;
      }
      goHome();
    };

    const handleHomeClick = () => {
      showModal(
        "Volver al inicio",
        "¿Desea guardar el estado actual de la planilla antes de salir? Se reemplazará la última planilla guardada.",
        <>
          <button
            type="button"
            onClick={goHome}
            className="rounded-md px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-800"
          >
            No guardar
          </button>
          <button
            type="button"
            onClick={saveAndGoHome}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Guardar y salir
          </button>
        </>,
      );
    };

    const countStarters = (team) => {
      const players = methods.getValues(`team${team}.players`) || [];
      return players.filter(
        (p) => String(p?.playerIn ?? "").split(":")[0] === "starter",
      ).length;
    };

    const handleForfeit = (option) => {
      setForfeitMenuOpen(false);

      if (quarter > 0) {
        showModal(
          "Advertencia",
          "El partido ya comenzó. Use «Terminar partido» para finalizarlo.",
        );
        return;
      }

      if (option !== "both") {
        const present = option === "A" ? "B" : "A";
        const starters = countStarters(present);
        if (starters < MIN_STARTERS) {
          showModal(
            "Advertencia",
            `Para terminar el partido por inasistencia del equipo ${option}, el equipo ${present} debe tener al menos ${MIN_STARTERS} jugadores marcados como titulares (actualmente tiene ${starters}).`,
          );
          return;
        }
      }

      const detail =
        option === "both"
          ? "Se registrará la inasistencia de ambos equipos (marcador 0-0, sin equipo ganador)."
          : `Se registrará la inasistencia del equipo ${option}. El equipo ${option === "A" ? "B" : "A"} ganará 20-0.`;

      showModal(
        "Confirmación de cierre por inasistencia",
        `${detail} Una vez finalizado, no podrá realizar más cambios. ¿Desea continuar?`,
        <button
          type="button"
          onClick={() => {
            endByForfeit(option);
            setOpen(false);
          }}
          className="rounded-md px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-800"
        >
          Proceder
        </button>,
      );
    };




    

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
      if (initialMode === "last") {
        const saved = loadSheet();

        if (saved?.store && saved?.form) {
          prevGameEnded.current = !!saved.store.gameEnded;

          methods.reset(saved.form);
          useMatchStore.getState().resetMatch();
          useMatchStore.setState(saved.store);
        } else {
          useMatchStore.getState().resetMatch();
          prevGameEnded.current = false;
          setModalTitle("Sin planilla guardada");
          setModalMessage(
            "No se encontró una planilla guardada. Se abrió una planilla nueva.",
          );
          setModalFooter(<></>);
          setOpen(true);
        }
      } else {
        useMatchStore.getState().resetMatch();
        prevGameEnded.current = false;
      }

      setReady(true);
    }, []);
    const handleFinalReport = async () => {
      if (!gameEnded || generatingReport || generating) return;
      setGeneratingReport(true);
      try {
        const file = await generateFinalMatchReportFile(methods.getValues());
        if (!file) return;

        // En móvil la entrega requiere un toque del usuario (modal de compartir)
        if (isMobileOrTablet()) setPendingFile(file);
        else downloadFile(file);
      } catch (err) {
        console.error(err);
        showModal("Error", "No se pudo generar el reporte final.");
      } finally {
        setGeneratingReport(false);
      }
    };

 







    if (!ready) return null
    return (
      <div className="flex h-full w-full flex-col bg-gray-100 dark:bg-gray-900">
        <div className="flex-1 overflow-auto">
          <div className="relative z-30 border-b border-gray-200 bg-gray-100/95 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95">
            <div
              className="mx-auto flex items-center justify-between gap-4"
              style={{ width: SHEET_WIDTH }}
            >
              <div className="  flex items-center gap-3 z-20">
                <button
                  type="button"
                  onClick={handleHomeClick}
                  className="flex w-fit cursor-pointer items-center text-sm font-medium text-blue-500 transition-colors hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 sm:text-base"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Inicio
                </button>

                <span className="h-5 w-px bg-gray-300 dark:bg-gray-700" />

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
                <button
                  type="submit"
                  form="planilla-form"
                  className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Guardar Planilla
                </button>
                <div ref={forfeitMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setForfeitMenuOpen((v) => !v)}
                    disabled={gameEnded}
                    aria-haspopup="menu"
                    aria-expanded={forfeitMenuOpen}
                    className="flex cursor-pointer items-center gap-1 rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Terminar por inasistencia
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${forfeitMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {forfeitMenuOpen && (
                    <div
                      role="menu"
                      className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
                    >
                      {FORFEIT_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          role="menuitem"
                          onClick={() => handleForfeit(opt.id)}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleFinalReport}
                  disabled={!gameEnded || generatingReport || generating}
                  className="cursor-pointer rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generatingReport
                    ? "Generando reporte..."
                    : "Generar reporte final"}
                </button>
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
              {pendingFile && (
                <Modal
                  open
                  onClose={() => setPendingFile(null)}
                  title="Planilla lista"
                  size="sm"
                  footer={
                    <>
                      <button
                        type="button"
                        onClick={handleDownloadPending}
                        className="rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        Descargar
                      </button>
                      <button
                        type="button"
                        onClick={handleSharePending}
                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Compartir
                      </button>
                    </>
                  }
                >
                  <p>
                    La imagen de la planilla ya se generó. Toque «Compartir»
                    para guardarla o enviarla, o «Descargar» para guardarla en
                    el dispositivo.
                  </p>
                </Modal>
              )}
            </div>
          </div>

          <FormProvider {...methods}>
            <form
              id="planilla-form"
              onSubmit={methods.handleSubmit(onSubmit, onInvalid)}
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