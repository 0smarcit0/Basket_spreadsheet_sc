import { createHeaderPainter, loadLogo, HEADER_BOTTOM } from "./pdfHeader"

const MARGIN = 40
const ESPACIO_MIN = 120 // espacio mínimo para empezar una tabla en la misma página

const sanitizeFileName = (name) => name.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim()
const fechaHoy = () => new Date().toLocaleDateString("es")

// Texto de la columna "Equipo" (incluye las observaciones de retiro, anulación, etc.)
const textoEquipo = (f) => {
  let t = f.equipo
  if (f.retirado) t += "  (Retirado: resultados anulados)"
  else if (f.anulado) t += "  (Resultados anulados: 2 inasistencias)"
  else if (f.inasistencias > 0) t += `  (${f.inasistencias} inasistencia)`
  if (f.porSorteo) t += "  (sorteo)"
  return t
}

const estiloBase = {
  theme: "grid",
  styles: { fontSize: 10, cellPadding: 4, halign: "center" },
  headStyles: { fillColor: [30, 64, 175], halign: "center" },
}

// secciones = [{ tipo?: "tabla" | "final", titulo?: string, filas }]
//  - "tabla" (por defecto): filas de calcularTabla / tablasGrupos
//  - "final": filas de clasificacionFinal (Pos, Equipo, Resultado)
// Devuelve un File; quien llama decide si descargar o compartir.
export async function generateTablaPosicionesFile(torneo, secciones, nota = "") {
  const { jsPDF } = await import("jspdf")
  const autoTable = (await import("jspdf-autotable")).default
  const logoData = await loadLogo()

  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const titulo = `Tabla de posiciones ${torneo.nombretorneo}`
  doc.setProperties({ title: titulo })

  // El encabezado se pinta una sola vez por página, aunque varias tablas disparen didDrawPage
  const paintHeader = createHeaderPainter(doc, logoData)
  const pintadas = new Set()
  const paint = () => {
    const n = doc.internal.getCurrentPageInfo().pageNumber
    if (pintadas.has(n)) return
    pintadas.add(n)
    paintHeader()
  }

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  paint()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.setTextColor(0)
  doc.text(torneo.nombretorneo, MARGIN, HEADER_BOTTOM + 35)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(12)
  doc.setTextColor(90)
  doc.text(`Tabla de posiciones · ${fechaHoy()}`, MARGIN, HEADER_BOTTOM + 55)
  doc.setTextColor(0)

  let y = HEADER_BOTTOM + 75

  for (const s of secciones) {
    // Si no queda espacio útil, la sección empieza en una página nueva
    if (y > pageH - MARGIN - ESPACIO_MIN) {
      doc.addPage()
      paint()
      y = HEADER_BOTTOM + 35
    }

    if (s.titulo) {
      doc.setFont("helvetica", "bold")
      doc.setFontSize(13)
      doc.setTextColor(0)
      doc.text(s.titulo, MARGIN, y)
      y += 10
    }

    const comun = {
      ...estiloBase,
      startY: y,
      margin: { top: HEADER_BOTTOM + 20, left: MARGIN, right: MARGIN, bottom: MARGIN },
      didDrawPage: paint,
    }

    if (s.tipo === "final") {
      autoTable(doc, {
        ...comun,
        head: [["Pos", "Equipo", "Resultado"]],
        body: s.filas.map((f) => [`${f.pos}${f.empate ? "=" : ""}`, `${f.equipo}${f.porSorteo ? "  (sorteo)" : ""}`, f.etapa]),
        columnStyles: { 0: { cellWidth: 35 }, 1: { halign: "left" }, 2: { halign: "left" } },
      })
    } else {
      autoTable(doc, {
        ...comun,
        head: [["Pos", "Equipo", "PJ", "PG", "PP", "PF", "PC", "Dif", "Pts"]],
        body: s.filas.map((f) => [
          `${f.pos}${f.empate ? "=" : ""}`,
          textoEquipo(f),
          f.pj, f.pg, f.pp, f.pf, f.pc,
          f.dif > 0 ? `+${f.dif}` : f.dif,
          f.pts,
        ]),
        columnStyles: { 0: { cellWidth: 35 }, 1: { halign: "left" }, 8: { fontStyle: "bold" } },
        // Equipos retirados / anulados en gris, como en la tabla de pantalla
        didParseCell: (data) => {
          if (data.section !== "body") return
          if (s.filas[data.row.index]?.anulado) data.cell.styles.textColor = [150, 150, 150]
        },
      })
    }

    y = doc.lastAutoTable.finalY + 25
  }

  // Nota del reglamento al final (con salto de página si no cabe)
  if (nota) {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(100)
    const lineas = doc.splitTextToSize(nota, pageW - MARGIN * 2)
    if (y + lineas.length * 12 > pageH - MARGIN) {
      doc.addPage()
      paint()
      y = HEADER_BOTTOM + 35
    }
    doc.text(lineas, MARGIN, y)
  }

  const blob = doc.output("blob")
  return new File([blob], `${sanitizeFileName(titulo)}.pdf`, { type: "application/pdf" })
}