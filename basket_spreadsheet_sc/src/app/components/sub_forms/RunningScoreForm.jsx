import ScoreColumn from "../form_components/ScoreColumn"
export default function RunningScoreForm() {
    return(
     <div>
        <div>Running Score</div>
        <div className="flex flex-row border border-b-2">
            <div className="flex flex-row " >
                <ScoreColumn team="A" range={[1,40]} />
                <ScoreColumn team="B" range={[1,40]}/>
            </div>
            <div className="flex flex-row">
                <ScoreColumn team="A" range={[41,80]}/>
                <ScoreColumn team="B" range={[41,80]}/>
            </div>
            <div className="flex flex-row">
                <ScoreColumn team="A" range={[81,120]}/>
                <ScoreColumn team="B" range={[81,120]}/>
            </div>
            <div className="flex flex-row">
                <ScoreColumn team="A" range={[121,160]}/>
                <ScoreColumn team="B" range={[121,160]}/>
            </div>
        </div>


    </div>)
}