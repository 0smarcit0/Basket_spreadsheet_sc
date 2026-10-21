import { useMatchStore } from "./store/matchStore"
import { createHeaderPainter, loadLogo, HEADER_BOTTOM } from "./pdfHeader"
import { generatePlanillaCanvas } from "./print_planilla"
function getTeamName(values, team) {
  const group = `team${team}`
  const name = values[group]?.name?.trim() || values.head?.[group]?.trim()
  return name || `Equipo ${team}`
}

function sanitizeFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim()
}

function buildTeamRows(values, team) {
  const group = `team${team}`
  const roster = (values[group]?.players ?? [])
    .map((player) => player)
    .filter((player) => player?.number !== undefined && player.number !== "")

  const shots = {}
  roster.forEach((player) => {
    shots[String(player.number)] = { ft: 0, two: 0, three: 0 }
  })

  Object.values(values.runningScore?.[team] ?? {}).forEach((row) => {
    if (!row?.points || !row?.dorsal) return
    const s = shots[String(row.dorsal)]
    if (!s) return
    if (row.points === 1) s.ft++
    else if (row.points === 2) s.two++
    else if (row.points === 3) s.three++
  })

  const rows = roster.map((player) => {
    const s = shots[String(player.number)]
    const fouls = Object.values(player.fouls ?? {}).filter(Boolean).length
    return [
      player.number,
      player.name || "—",
      s.ft,
      s.two,
      s.three,
      s.ft + s.two * 2 + s.three * 3,
      fouls,
    ]
  })

  const total = (col) => rows.reduce((acc, r) => acc + r[col], 0)
  const footer = ["", "TOTAL", total(2), total(3), total(4), total(5), total(6)]

  return { rows, footer }
}

function buildTopScorers(rows) {
  const categories = [
    { label: "Tiros libres", col: 2 },
    { label: "Tiros de 2", col: 3 },
    { label: "Tiros de 3", col: 4 },
  ]

  return categories.map(({ label, col }) => {
    const max = Math.max(0, ...rows.map((r) => r[col]))
    if (max === 0) return [label, "—", 0]
    const names = rows
      .filter((r) => r[col] === max)
      .map((r) => `#${r[0]} ${r[1]}`)
      .join(", ")
    return [label, names, max]
  })
}

export async function generateGameReport(values, team) {
  if (!useMatchStore.getState().gameEnded) return

  const { jsPDF } = await import("jspdf")
  const autoTable = (await import("jspdf-autotable")).default
  const logoData = await loadLogo()

  const teamName = getTeamName(values, team)
  const { rows, footer } = buildTeamRows(values, team)
  const topScorers = buildTopScorers(rows)

  const doc = new jsPDF({ unit: "pt", format: "a4" })
  doc.setProperties({ title: `Reporte final ${teamName}` })

  const paintHeader = createHeaderPainter(doc, logoData)
  paintHeader()

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(`Reporte final ${teamName}`, 40, HEADER_BOTTOM + 35)

  const y = HEADER_BOTTOM + 65
  doc.setFontSize(13)
  doc.text(`Equipo ${team}: ${teamName}`, 40, y)


  autoTable(doc, {
    margin: { top: HEADER_BOTTOM + 20, left: 40, right: 40 },
    didDrawPage: paintHeader,
    startY: y + 10,
    head: [["Dorsal", "Nombre", "Tiros libres", "Tiros de 2", "Tiros de 3", "Puntos anotados", "Faltas cometidas"]],
    body: rows,
    foot: [footer],
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [30, 64, 175], halign: "center" },
    footStyles: { fillColor: [229, 231, 235], textColor: 0, fontStyle: "bold", halign: "center" },
    columnStyles: {
      0: { halign: "center", cellWidth: 45 },
      1: { halign: "left" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "center" },
      6: { halign: "center" },
    },
  })

  let y2 = doc.lastAutoTable.finalY + 30
  if (y2 > doc.internal.pageSize.getHeight() - 140) {
    doc.addPage()
    paintHeader()
    y2 = HEADER_BOTTOM + 35
  }

  doc.setFontSize(13)
  doc.setFont("helvetica", "bold")
  doc.text("Mejores anotadores", 40, y2)

  autoTable(doc, {
    margin: { top: HEADER_BOTTOM + 20, left: 40, right: 40 },
    didDrawPage: paintHeader,
    startY: y2 + 10,
    head: [["Categoría", "Jugador", "Cantidad"]],
    body: topScorers,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [30, 64, 175], halign: "center" },
    columnStyles: {
      0: { halign: "left", cellWidth: 110 },
      1: { halign: "left" },
      2: { halign: "center", cellWidth: 70 },
    },
  })

  doc.save(`Reporte final ${sanitizeFileName(teamName)}.pdf`)

}


// "DD-MM-YYYY" con la fecha local de hoy (sin "/" porque no es válido en nombres de archivo)
const todayStamp = () => {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  return `${dd}-${mm}-${d.getFullYear()}`
}

const PAGE_MARGIN = 20   // margen alrededor de la imagen de la planilla
const TABLE_MARGIN = 40  // margen de las tablas
const MIN_TABLE_SPACE = 140 // espacio mínimo para empezar una tabla en la misma página

// Genera un PDF con la planilla (imagen) y debajo la tabla de ambos equipos.
// Devuelve un File; quien llama decide si descargar o compartir.
export async function generateFinalMatchReportFile(values, elementId = "planilla-form") {
  if (!useMatchStore.getState().gameEnded) return null

  const { jsPDF } = await import("jspdf")
  const autoTable = (await import("jspdf-autotable")).default

  // 1) Planilla como imagen
  const canvas = await generatePlanillaCanvas(elementId)
  const ratio = canvas.height / canvas.width
  const imageData = canvas.toDataURL("image/jpeg", 0.92)
  canvas.width = canvas.height = 0 // libera memoria (importante en móviles)

  // 2) Documento y planilla ajustada al ancho de la hoja
  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const stamp = todayStamp()
  doc.setProperties({ title: `Reporte final partido ${stamp}` })

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()

  let imgW = pageW - PAGE_MARGIN * 2
  let imgH = imgW * ratio
  const maxH = pageH - PAGE_MARGIN * 2
  if (imgH > maxH) {
    imgH = maxH
    imgW = imgH / ratio
  }
  doc.addImage(imageData, "JPEG", (pageW - imgW) / 2, PAGE_MARGIN, imgW, imgH, undefined, "FAST")

  // 3) Tabla de cada equipo, debajo de la planilla
  let cursorY = PAGE_MARGIN + imgH + 20

  for (const team of ["A", "B"]) {
    // Si no queda espacio útil en la página, la tabla empieza en una nueva
    if (cursorY > pageH - TABLE_MARGIN - MIN_TABLE_SPACE) {
      doc.addPage()
      cursorY = TABLE_MARGIN
    }

    const teamName = getTeamName(values, team)
    const { rows, footer } = buildTeamRows(values, team)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.setTextColor(0)
    doc.text(`Equipo ${team}: ${teamName}`, TABLE_MARGIN, cursorY + 12)

    autoTable(doc, {
      startY: cursorY + 20,
      margin: { top: TABLE_MARGIN, bottom: TABLE_MARGIN, left: TABLE_MARGIN, right: TABLE_MARGIN },
      head: [["Dorsal", "Nombre", "Tiros libres", "Tiros de 2", "Tiros de 3", "Puntos anotados", "Faltas cometidas"]],
      body: rows,
      foot: [footer],
      theme: "grid",
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [30, 64, 175], halign: "center" },
      footStyles: { fillColor: [229, 231, 235], textColor: 0, fontStyle: "bold", halign: "center" },
      columnStyles: {
        0: { halign: "center", cellWidth: 45 },
        1: { halign: "left" },
        2: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" },
      },
    })

    cursorY = doc.lastAutoTable.finalY + 25
  }

  const blob = doc.output("blob")
  return new File([blob], `Reporte final partido ${stamp}.pdf`, { type: "application/pdf" })
}

