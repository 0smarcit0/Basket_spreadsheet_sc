"use client"
import { useFormContext } from "react-hook-form"

export default function FormHeadInputs() {
    const { register } = useFormContext();

    return (
        <div className="w-full font-sans text-sm font-bold text-gray-800">
            <div className="flex w-full gap-2 mb-1 px-1">
                <div className="flex flex-1 items-end">
                    <label className="mr-1 whitespace-nowrap">Team A</label>
                    <input 
                        type="text"
                        className="flex-1 border-b-2 border-black bg-transparent focus:outline-none px-1 leading-tight" 
                        {...register("head.teamA")} 
                    />
                </div>
                <div className="flex flex-1 items-end">
                    <label className="mr-1 whitespace-nowrap">Team B</label>
                    <input 
                        type="text"
                        className="flex-1 border-b-2 border-black bg-transparent focus:outline-none px-1 leading-tight" 
                        {...register("head.teamB")} 
                    />
                </div>
            </div>

            <div className="border-2 border-black p-2 flex flex-col gap-3">
                <div className="flex w-full items-end gap-3">
                    <div className="flex items-end flex-[1.5]">
                        <label className="mr-1 whitespace-nowrap">Competition</label>
                        <input 
                            type="text" 
                            className="flex-1 border-b border-black bg-transparent focus:outline-none px-1" 
                            {...register("head.competition")} 
                        />
                    </div>
                    <div className="flex items-end flex-[1]">
                        <label className="mr-1 whitespace-nowrap">Date</label>
                        <input 
                            type="date" 
                            className="flex-1 border-b border-black bg-transparent focus:outline-none px-1" 
                            {...register("head.date")} 
                        />
                    </div>
                    <div className="flex items-end flex-[1]">
                        <label className="mr-1 whitespace-nowrap">Time</label>
                        <input 
                            type="time" 
                            className="flex-1 border-b border-black bg-transparent focus:outline-none px-1" 
                            {...register("head.time")} 
                        />
                    </div>
                    <div className="flex items-end flex-[2]">
                        <label className="mr-1 whitespace-nowrap">Referee</label>
                        <input 
                            type="text" 
                            className="flex-1 border-b border-black bg-transparent focus:outline-none px-1" 
                            {...register("head.referee")} 
                        />
                    </div>
                </div>

                <div className="flex w-full items-end gap-3">
                    <div className="flex items-end flex-[1.5]">
                        <label className="mr-1 whitespace-nowrap">Game No.</label>
                        <input 
                            type="text" 
                            className="flex-1 border-b border-black bg-transparent focus:outline-none px-1" 
                            {...register("head.gameNo")} 
                        />
                    </div>
                    <div className="flex items-end flex-[2]">
                        <label className="mr-1 whitespace-nowrap">Place</label>
                        <input 
                            type="text" 
                            className="flex-1 border-b border-black bg-transparent focus:outline-none px-1" 
                            {...register("head.place")} 
                        />
                    </div>
                    <div className="flex items-end flex-[1.5]">
                        <label className="mr-1 whitespace-nowrap">Umpire 1</label>
                        <input 
                            type="text" 
                            className="flex-1 border-b border-black bg-transparent focus:outline-none px-1" 
                            {...register("head.umpire1")} 
                        />
                    </div>
                    <div className="flex items-end flex-[1.5]">
                        <label className="mr-1 whitespace-nowrap">Umpire 2</label>
                        <input 
                            type="text" 
                            className="flex-1 border-b border-black bg-transparent focus:outline-none px-1" 
                            {...register("head.umpire2")} 
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}