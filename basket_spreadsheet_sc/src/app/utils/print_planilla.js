"use client"
import html2canvas from "html2canvas-pro"

// Dispositivo táctil como entrada principal (teléfonos y tablets,
// incluso cuando el navegador está en "sitio de escritorio")
const hasCoarsePointer = () =>
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(pointer: coarse)").matches &&
    navigator.maxTouchPoints > 0

// ¿El navegador puede compartir archivos? (requiere HTTPS o localhost)
export const canShareFiles = () => {
    if (typeof navigator === "undefined" || !navigator.canShare) return false
    try {
        const probe = new File(["x"], "x.png", { type: "image/png" })
        return navigator.canShare({ files: [probe] })
    } catch {
        return false
    }
}

// Detecta teléfono/tablet por capacidades, con el user agent solo como respaldo
export const isMobileOrTablet = () => {
    if (typeof navigator === "undefined") return false

    // 1) Chromium moderno lo informa directamente
    if (navigator.userAgentData?.mobile) return true

    // 2) Táctil + puede compartir archivos: cubre tablets en modo escritorio e iPadOS
    if (hasCoarsePointer() && canShareFiles()) return true

    // 3) Respaldo por user agent (incluye iPadOS, que se reporta como "Macintosh")
    const ua = navigator.userAgent
    const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(ua)
    const isIPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1

    return isMobileUA || isIPadOS
}

const canvasToBlob = (canvas) =>
    new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("No se pudo generar la imagen"))),
            "image/png"
        )
    })

// Escala según dispositivo, limitada por el área máxima de canvas que soporta cada plataforma
// (iOS Safari ≈ 16.7M píxeles; escritorio soporta bastante más)
const getScale = (width, height) => {
    const mobile = isMobileOrTablet()
    const target = mobile ? 2 : 3
    const maxPixels = mobile ? 14_000_000 : 32_000_000
    const maxByArea = Math.sqrt(maxPixels / (width * height))
    return Math.min(target, maxByArea)
}

const SKIP_TYPES = ["checkbox", "radio", "hidden", "button", "submit", "reset", "file", "image"]

// Reemplaza inputs/textarea/select por divs con el mismo estilo y el texto bien alineado.
// Solo afecta al clon que usa html2canvas, no al formulario real.
const replaceFormControls = (clonedDoc, root) => {
    const view = clonedDoc.defaultView

    root.querySelectorAll("input, textarea, select").forEach((el) => {
        const tag = el.tagName.toLowerCase()
        if (tag === "input" && SKIP_TYPES.includes((el.type || "").toLowerCase())) return

        const cs = view.getComputedStyle(el)

        let text = ""
        if (tag === "select") {
            text = el.options[el.selectedIndex]?.text ?? ""
        } else {
            text = el.value ?? ""
        }

        const div = clonedDoc.createElement("div")

        // Copia todos los estilos calculados (tamaño, borde, fuente, color, fondo...)
        for (const prop of cs) {
            div.style.setProperty(prop, cs.getPropertyValue(prop))
        }

        // Alineación horizontal según el text-align original del input
        const align = cs.textAlign
        let justify = "flex-start"
        if (align === "center") justify = "center"
        else if (align === "right" || align === "end") justify = "flex-end"

        const isTextarea = tag === "textarea"

        div.style.display = "flex"
        div.style.justifyContent = justify
        div.style.alignItems = isTextarea ? "flex-start" : "center" // centrado vertical
        div.style.textAlign = align
        div.style.whiteSpace = isTextarea ? "pre-wrap" : "nowrap"
        div.style.overflow = "hidden"
        div.style.lineHeight = isTextarea ? cs.lineHeight : "normal"
        div.style.appearance = "none"

        // Un span interno evita que el texto se corte o se desplace
        const span = clonedDoc.createElement("span")
        span.textContent = text
        span.style.maxWidth = "100%"
        span.style.overflow = "hidden"
        span.style.textOverflow = "clip"
        div.appendChild(span)

        el.parentNode.replaceChild(div, el)
    })
}
export const generatePlanillaCanvas = async (elementId) => {
    const element = document.getElementById(elementId)
    if (!element) throw new Error(`No se encontró el elemento #${elementId}`)

    // Asegura que las fuentes estén cargadas antes de capturar
    if (document.fonts?.ready) await document.fonts.ready

    const { width, height } = element.getBoundingClientRect()

    return html2canvas(element, {
        scale: getScale(width, height),
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
            const clonedRoot = clonedDoc.getElementById(elementId)
            if (clonedRoot) replaceFormControls(clonedDoc, clonedRoot)
        },
    })
}
// Paso 1: genera el archivo (asíncrono, puede tardar). NO comparte ni descarga.
export const generatePlanillaFile = async (elementId, fileName = "planilla.png") => {
    const canvas = await generatePlanillaCanvas(elementId)
    const blob = await canvasToBlob(canvas)
    return new File([blob], fileName, { type: "image/png" })
}

// Descarga clásica (PC o fallback)
export const downloadFile = (file) => {
    const url = URL.createObjectURL(file)
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Paso 2 (móvil): debe llamarse DIRECTO desde un onClick, sin await previo.
export const sharePlanillaFile = async (file) => {
    if (navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title: "Planilla" })
            return true
        } catch (err) {
            if (err.name === "AbortError") return true
        }
    }
    downloadFile(file)
    return false
}