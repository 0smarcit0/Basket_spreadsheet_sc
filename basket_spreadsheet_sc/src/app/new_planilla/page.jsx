import FormHeadInputs from "../components/FormHeadInputs";
import TeamForm from "../components/TeamForm";
import CrewForm from "../components/CrewForm";
import RunningScoreForm from "../components/RunningScoreForm";

export default function FormPlanilla() {

    return(
        <div>

            <FormHeadInputs />
            <TeamForm />
            <CrewForm />
            <RunningScoreForm />

        </div>
    )
}