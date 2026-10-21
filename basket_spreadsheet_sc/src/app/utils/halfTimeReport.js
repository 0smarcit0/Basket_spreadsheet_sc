import { useMatchStore } from "./store/matchStore"
import { createHeaderPainter, loadLogo, HEADER_BOTTOM } from "./pdfHeader"
const HALF_LAST_PERIOD = 2

function getTeamName(values, team) {
  const group = `team${team}`
  const name = values[group]?.name?.trim() || values.head?.[group]?.trim()
  return name || `Equipo ${team}`
}

function sanitizeFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim()
}

function buildTeamRows(values, team, boundaries) {
  const group = `team${team}`
  const roster = (values[group]?.players ?? [])
    .map((player, index) => ({ player, index }))
    .filter(({ player }) => player?.number !== undefined && player.number !== "")

  const shots = {}
  roster.forEach(({ player }) => {
    shots[String(player.number)] = { ft: 0, two: 0, three: 0 }
  })

  Object.values(values.runningScore?.[team] ?? {}).forEach((row) => {
    if (!row?.points || !row?.dorsal) return
    if (Number(row.period) > HALF_LAST_PERIOD) return
    const s = shots[String(row.dorsal)]
    if (!s) return
    if (row.points === 1) s.ft++
    else if (row.points === 2) s.two++
    else if (row.points === 3) s.three++
  })

  const rows = roster.map(({ player, index }) => {
    const s = shots[String(player.number)]
    const currentFouls = Object.values(player.fouls ?? {}).filter(Boolean).length
    const fouls = boundaries[`${group}-${index}`] ?? currentFouls
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

export async function generateHalftimeReport(values, team) {
  const { jsPDF } = await import("jspdf")
  const autoTable = (await import("jspdf-autotable")).default
  const logoData = await loadLogo()

  const boundaries = useMatchStore.getState().halftimeBoundaries
  const teamName = getTeamName(values, team)
  const { rows, footer } = buildTeamRows(values, team, boundaries)

  const doc = new jsPDF({ unit: "pt", format: "a4" })
  doc.setProperties({ title: `Reporte mitad ${teamName}` })

  const paintHeader = createHeaderPainter(doc, logoData)
  paintHeader()

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(`Reporte mitad ${teamName}`, 40, HEADER_BOTTOM + 35)

  let y = HEADER_BOTTOM + 65

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

  y = doc.lastAutoTable.finalY + 35

  doc.save(`Reporte mitad ${sanitizeFileName(teamName)}.pdf`)
}