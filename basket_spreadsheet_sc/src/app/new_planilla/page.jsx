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

export default function FormPlanilla() {
    const methods = useForm();
    const quarter = useMatchStore((state) => state.quarter)
    const increaseQuarter = useMatchStore((state) => state.increaseQuarter)
    const onSubmit = (data) => {
        alert(JSON.stringify(data))
    }

    return (
        
        
        <div className="h-full w-full overflow-auto bg-gray-100 dark:bg-gray-900">
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

                    <div className="flex items-center" style={{ gap: 16, marginTop: 16 }}>
                        <input type="submit" value="Submit" className="cursor-pointer" />
                        <label>Quarter: {quarter}</label>
                        <button type="button" onClick={increaseQuarter}>Next Quarter</button>
                    </div>
                </form>
            </FormProvider>
        </div>
    )
}