"use client"
import { useFormContext, Controller } from "react-hook-form"
import logoCabl from "../../../assets/logo_cabl.jpeg"
import logoFiba from "../../../assets/fiba_logo.png"
import useTorneos from "../../utils/hooks/useTorneos"

export const BANNER_HEIGHT = 130

// Sin bordes, sin outline y sin ring, tampoco en focus
const inputClass =
    "w-full border-0 bg-transparent px-2 py-1 text-center text-sm font-semibold uppercase outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 dark:bg-gray-950"

// Como ya no hay borde, el error se muestra con un fondo rojizo
const errorClass = "bg-red-100 dark:bg-red-950"

function UpperInput({ name, placeholder }) {
    const { control, formState: { errors } } = useFormContext()
    return (
        <Controller
            name={name}
            control={control}
            defaultValue=""
            rules={{ required: "Campo obligatorio" }}
            render={({ field }) => (
                <input
                    {...field}
                    type="text"
                    placeholder={placeholder}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    className={`${inputClass} ${errors[name] ? errorClass : ""}`}
                />
            )}
        />
    )
}

export default function SheetBanner() {
    const { register, formState: { errors } } = useFormContext()
    const { torneos } = useTorneos()

    return (
        <div className="flex items-center justify-between gap-4" style={{ height: BANNER_HEIGHT }}>
            <img
                src={logoFiba.src ?? logoFiba}
                alt="FIBA"
                className="h-auto max-h-[80%] w-[25%] shrink-0 object-contain"
            />

            <div className="flex flex-1 flex-col gap-1.5">
                <div className="text-center text-base font-bold tracking-wide">
                    PLANILLA DE JUEGO DE BALONCESTO
                </div>

                <select
                    defaultValue=""
                    {...register("tournament", { required: "Campo obligatorio" })}
                    className={`${inputClass} appearance-none rounded-none shadow-none ${errors.tournament ? errorClass : ""}`}
                >
                    <option value="" disabled>Seleccione un torneo</option>
                    {torneos.map((nombre) => (
                        <option key={nombre} value={nombre}>{nombre}</option>
                    ))}
                </select>

                <UpperInput name="headerLine3" placeholder="DIA-00-MES-HORA AM/PM-LUGAR" />
                <UpperInput name="headerLine4" placeholder="CIUDAD - ESTADO - PAIS" />
            </div>

            <img
                src={logoCabl.src ?? logoCabl}
                alt="CABL"
                className="h-auto max-h-[80%] w-[25%] shrink-0 object-contain"
            />
        </div>
    )
}