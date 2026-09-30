"use client"
import { useForm, FormProvider } from "react-hook-form"
import FormHeadInputs from "../components/sub_forms/FormHeadInputs";
import TeamForm from "../components/sub_forms/TeamForm";
import TableForm from "../components/sub_forms/TableForm";
import RunningScoreForm from "../components/sub_forms/RunningScoreForm";
import HalftimeWatcher from "../components/form_components/HalfTimeWatcher";
import { useMatchStore } from "../utils/store/matchStore";

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
    const quarter = useMatchStore((state) => state.quarter)
    const setQuarter = useMatchStore((state) => state.setQuarter) 
    const teamAlastCell = useMatchStore((state)=>state.numberCellNameA)
    const teamAscore = useMatchStore((state)=>state.teamAcurrentScore)
    const teamBlastCell = useMatchStore((state)=>state.numberCellNameB)
    const teamBscore = useMatchStore((state)=>state.teamBcurrentScore)
    const onSubmit = (data) => {
        alert(JSON.stringify(data))
    }

    return (
        <div className="h-full w-full overflow-auto bg-gray-100 dark:bg-gray-900">
            <div>
                {teamAlastCell}
            </div>
            <div>
                {teamBlastCell}
            </div>
            <div>
                {teamAscore}
            </div>
            <div>
                {teamBscore}
            </div>
            <div className="flex items-center justify-between w-[1050px] mt-4">
                        <input 
                            type="submit" 
                            value="Submit" 
                            className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" 
                        />
                        
                        <div className="flex bg-gray-300 dark:bg-gray-700 p-1 rounded-lg">
                            {QUARTERS.map((q) => (
                                <button
                                    key={q.id}
                                    type="button"
                                    onClick={() => setQuarter(q.id)}
                                    className={`
                                        px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200
                                        ${quarter === q.id 
                                            ? 'bg-white text-gray-900 shadow-sm' 
                                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-800' // Estilo para los cuartos inactivos con fondo gris[cite: 1]
                                        }
                                    `}
                                >
                                    {q.label}
                                </button>
                            ))}
                        </div>
                    </div>
            <FormProvider {...methods}>
                <form
                    onSubmit={methods.handleSubmit(onSubmit)}
                    style={{ width: SHEET_WIDTH, height: SHEET_HEIGHT }}
                    className="
                        relative
                        mx-auto my-4
                        bg-white dark:bg-gray-950
                        shadow-md
                        p-4
                    "
                >
                    <HalftimeWatcher getValues={methods.getValues} groups={["teamA", "teamB"]} />
                    <div className="w-[1061px]">
                        <FormHeadInputs />
                    </div>

                    <div className="flex flex-row items-start w-[1050px] gap-[14px]">
                        <div className="flex flex-col w-[500px] shrink-0">
                            <div className="flex flex-col h-[1018px]">
                                <div className="h-[509px]">
                                    <TeamForm team="A" />
                                </div>
                                <div className="h-[509px]">
                                    <TeamForm team="B" />
                                </div>
                            </div>
                            <TableForm />
                        </div>

                        <div className="h-[1018px] w-[547px] shrink-0">
                            <RunningScoreForm />
                        </div>
                    </div>

                    
                </form>
            </FormProvider>
        </div>
    )
}