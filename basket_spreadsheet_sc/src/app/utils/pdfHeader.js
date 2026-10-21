import logo from "../../assets/logo_cabl.jpeg"

export const ORG_NAME = "Círculo de Árbitros de Baloncesto Libertador"
export const HEADER_BOTTOM = 85 
const LOGO_HEIGHT = 50
const LOGO_MAX_WIDTH = 90

let logoPromise = null


export function loadLogo() {
  if (!logoPromise) {
    logoPromise = fetch(logo.src)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo cargar el logo")
        return res.blob()
      })
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
      )
      .catch(() => {
        logoPromise = null 
        return null
      })
  }
  return logoPromise
}



export function createHeaderPainter(doc, logoData) {
  const painted = new Set()

  return () => {
    const page = doc.internal.getCurrentPageInfo().pageNumber
    if (painted.has(page)) return
    painted.add(page)

    const pageWidth = doc.internal.pageSize.getWidth()

    if (logoData) {
      const ratio = logo.width && logo.height ? logo.width / logo.height : 1
      let h = LOGO_HEIGHT
      let w = h * ratio
      if (w > LOGO_MAX_WIDTH) {
        w = LOGO_MAX_WIDTH
        h = w / ratio
      }
      doc.addImage(logoData, "JPEG", 40, 25 + (LOGO_HEIGHT - h) / 2, w, h)
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text(ORG_NAME, pageWidth / 2, 55, { align: "center" })

    doc.setDrawColor(30, 64, 175)
    doc.setLineWidth(1)
    doc.line(40, HEADER_BOTTOM, pageWidth - 40, HEADER_BOTTOM)
  }
}