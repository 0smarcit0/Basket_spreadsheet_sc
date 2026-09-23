"use client"
import { useForm, FormProvider } from "react-hook-form"
import FormHeadInputs from "../components/sub_forms/FormHeadInputs";
import TeamForm from "../components/sub_forms/TeamForm";
import CrewForm from "../components/sub_forms/CrewForm";
import RunningScoreForm from "../components/sub_forms/RunningScoreForm";
import {useState} from "react";

export default function FormPlanilla() {
    const methods = useForm();
    const [quarter, setQuarter] = useState(1);

    const onSubmit = (data) => {
        alert(JSON.stringify(data))
    }
    const handleChangeQuarter = ()=>{
        if (quarter < 8){
            setQuarter(quarter+1)
        }

    }

    return (
        <div>
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)}>
                    <FormHeadInputs />
                    <TeamForm team="A" quarter = {quarter}/>
                    <TeamForm team="B" quarter = {quarter}/>
                    <CrewForm />
                    <RunningScoreForm />
                    <input type="submit" value="Submit" />
                    <label className="ml-2">Quarter: {quarter}</label>
                    <button type="button" onClick={handleChangeQuarter}>Next Quarter</button>
                </form>
            </FormProvider>
        </div>
    )
}