"use client"
import { useState } from "react"
import { useFormContext, useController } from "react-hook-form"
import logoCabl from "../../../assets/logo_cabl.jpeg"
import logoFiba from "../../../assets/fiba_logo.png"
import useTorneos from "../../utils/hooks/useTorneos"
import Modal from "../Modal"

export const BANNER_HEIGHT = 130

const inputClass =
    "w-full border-0 bg-transparent px-2 py-1 text-center text-sm font-semibold uppercase outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 dark:bg-gray-950"

const errorClass = "bg-red-100 dark:bg-red-950"

const fieldClass =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"



const WEEKDAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

// Estado + su ciudad capital
const VENEZUELA_STATES = [
    { state: "Amazonas", capital: "Puerto Ayacucho" },
    { state: "Anzoátegui", capital: "Barcelona" },
    { state: "Apure", capital: "San Fernando de Apure" },
    { state: "Aragua", capital: "Maracay" },
    { state: "Barinas", capital: "Barinas" },
    { state: "Bolívar", capital: "Ciudad Bolívar" },
    { state: "Carabobo", capital: "Valencia" },
    { state: "Cojedes", capital: "San Carlos" },
    { state: "Delta Amacuro", capital: "Tucupita" },
    { state: "Dependencias Federales", capital: "Gran Roque" },
    { state: "Distrito Capital", capital: "Caracas" },
    { state: "Falcón", capital: "Coro" },
    { state: "Guárico", capital: "San Juan de los Morros" },
    { state: "La Guaira", capital: "La Guaira" },
    { state: "Lara", capital: "Barquisimeto" },
    { state: "Mérida", capital: "Mérida" },
    { state: "Miranda", capital: "Los Teques" },
    { state: "Monagas", capital: "Maturín" },
    { state: "Nueva Esparta", capital: "La Asunción" },
    { state: "Portuguesa", capital: "Guanare" },
    { state: "Sucre", capital: "Cumaná" },
    { state: "Táchira", capital: "San Cristóbal" },
    { state: "Trujillo", capital: "Trujillo" },
    { state: "Yaracuy", capital: "San Felipe" },
    { state: "Zulia", capital: "Maracaibo" },
]

const byName = (a, b) => a.localeCompare(b, "es")
const STATES = VENEZUELA_STATES.map((e) => e.state).sort(byName)
const CAPITALS = VENEZUELA_STATES.map((e) => e.capital).sort(byName)
const COUNTRIES = ["Venezuela"]



const LINE3_DEFAULTS = { weekday: "", day: "", month: "", time: "", place: "" }
const LINE4_DEFAULTS = { city: "", state: "", country: COUNTRIES[0] }

// "17:35" -> "05:35 PM"
const formatTime12 = (hhmm) => {
    if (!hhmm) return ""
    const [h, m] = hhmm.split(":").map(Number)
    const suffix = h >= 12 ? "PM" : "AM"
    const h12 = h % 12 || 12
    return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`
}

// DIA-00-MES-HORA AM/PM-LUGAR (los valores vacíos simplemente se omiten)
const buildLine3 = ({ weekday, day, month, time, place }) => {
    const dayText = day
        ? String(Math.min(31, Math.max(1, Number(day)))).padStart(2, "0")
        : ""
    return [weekday, dayText, month, formatTime12(time), place?.trim()]
        .filter(Boolean)
        .join(" ")
        .toUpperCase()
}


const buildLine4 = ({ city, state, country }) =>
    [city, state, country].filter(Boolean).join("-").toUpperCase()


function Field({ label, children }) {
    return (
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 dark:text-gray-200">
            {label}
            {children}
        </label>
    )
}

function Options({ items, placeholder = "—" }) {
    return (
        <>
            <option value="">{placeholder}</option>
            {items.map((item) => (
                <option key={item} value={item}>{item}</option>
            ))}
        </>
    )
}

// Campos del modal "Encabezado"
function Line3Fields({ draft, setDraft }) {
    const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.value }))

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Día de la semana">
                <select className={fieldClass} value={draft.weekday} onChange={set("weekday")}>
                    <Options items={WEEKDAYS} />
                </select>
            </Field>

            <Field label="Día del mes">
                <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={31}
                    className={fieldClass}
                    value={draft.day}
                    onChange={set("day")}
                />
            </Field>

            <Field label="Mes">
                <select className={fieldClass} value={draft.month} onChange={set("month")}>
                    <Options items={MONTHS} />
                </select>
            </Field>

            <Field label="Hora">
                <input
                    type="time"
                    className={fieldClass}
                    value={draft.time}
                    onChange={set("time")}
                />
            </Field>

            <div className="sm:col-span-2">
                <Field label="Lugar">
                    <input
                        type="text"
                        className={fieldClass}
                        value={draft.place}
                        onChange={set("place")}
                    />
                </Field>
            </div>
        </div>
    )
}

// Campos del modal "Ciudad, estado y país"
function Line4Fields({ draft, setDraft }) {
    // Como solo hay capitales, ciudad y estado van de la mano: al elegir uno se completa el otro
    const handleState = (e) => {
        const state = e.target.value
        const entry = VENEZUELA_STATES.find((s) => s.state === state)
        setDraft((d) => ({ ...d, state, city: entry?.capital ?? "" }))
    }
    const handleCity = (e) => {
        const city = e.target.value
        const entry = VENEZUELA_STATES.find((s) => s.capital === city)
        setDraft((d) => ({ ...d, city, state: entry?.state ?? "" }))
    }

    return (
        <div className="flex flex-col gap-3">
    
            <Field label="Estado">
                <select className={fieldClass} value={draft.state} onChange={handleState}>
                    <Options items={STATES} />
                </select>
            </Field>
            <Field label="Ciudad">
                <select className={fieldClass} value={draft.city} onChange={handleCity}>
                    <Options items={CAPITALS} />
                </select>
            </Field>

            <Field label="País">
                <select
                    className={fieldClass}
                    value={draft.country}
                    onChange={(e) => setDraft((d) => ({ ...d, country: e.target.value }))}
                >
                    <Options items={COUNTRIES} />
                </select>
            </Field>
        </div>
    )
}


function HeaderPickerInput({ name, partsName, defaultParts, placeholder, title, build, Fields }) {
    const { control, formState: { errors } } = useFormContext()
    const { field } = useController({
        name,
        control,
        defaultValue: "",
        rules: { required: "Campo obligatorio" },
    })
    const { field: partsField } = useController({
        name: partsName,
        control,
        defaultValue: defaultParts,
    })

    const [open, setOpen] = useState(false)
    const [draft, setDraft] = useState(defaultParts)

    const openModal = () => {
        setDraft({ ...defaultParts, ...(partsField.value ?? {}) })
        setOpen(true)
    }

    const accept = () => {
        partsField.onChange(draft)
        field.onChange(build(draft))
        setOpen(false)
    }

    return (
        <>
            <input
                ref={field.ref}
                name={field.name}
                type="text"
                readOnly
                value={field.value ?? ""}
                placeholder={placeholder}
                onClick={openModal}
                onBlur={field.onBlur}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        openModal()
                    }
                }}
                className={`${inputClass} cursor-pointer ${errors[name] ? errorClass : ""}`}
            />

            {open && (
                <Modal
                    open
                    onClose={() => setOpen(false)}
                    title={title}
                    size="md"
                    footer={
                        <button
                            type="button"
                            onClick={accept}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Aceptar
                        </button>
                    }
                >
                    <Fields draft={draft} setDraft={setDraft} />
                </Modal>
            )}
        </>
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

                <HeaderPickerInput
                    name="headerLine3"
                    partsName="headerLine3Parts"
                    defaultParts={LINE3_DEFAULTS}
                    placeholder="DIA-00-MES-HORA AM/PM-LUGAR"
                    title="Encabezado"
                    build={buildLine3}
                    Fields={Line3Fields}
                />

                <HeaderPickerInput
                    name="headerLine4"
                    partsName="headerLine4Parts"
                    defaultParts={LINE4_DEFAULTS}
                    placeholder="CIUDAD - ESTADO - PAIS"
                    title="Ciudad, estado y país"
                    build={buildLine4}
                    Fields={Line4Fields}
                />
            </div>

            <img
                src={logoCabl.src ?? logoCabl}
                alt="CABL"
                className="h-auto max-h-[80%] w-[25%] shrink-0 object-contain"
            />
        </div>
    )
}