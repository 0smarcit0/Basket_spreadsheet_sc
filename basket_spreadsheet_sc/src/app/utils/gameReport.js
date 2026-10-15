import { useMatchStore } from "./store/matchStore"

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

  const teamName = getTeamName(values, team)
  const { rows, footer } = buildTeamRows(values, team)
  const topScorers = buildTopScorers(rows)

  const doc = new jsPDF({ unit: "pt", format: "a4" })
  doc.setProperties({ title: `Reporte final ${teamName}` })

  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(`Reporte final ${teamName}`, 40, 50)

  const y = 80
  doc.setFontSize(13)
  doc.text(`Equipo ${team}: ${teamName}`, 40, y)

  autoTable(doc, {
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
    margin: { left: 40, right: 40 },
  })

  let y2 = doc.lastAutoTable.finalY + 30
  if (y2 > doc.internal.pageSize.getHeight() - 140) {
    doc.addPage()
    y2 = 50
  }

  doc.setFontSize(13)
  doc.setFont("helvetica", "bold")
  doc.text("Mejores anotadores", 40, y2)

  autoTable(doc, {
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
    margin: { left: 40, right: 40 },
  })

  doc.save(`Reporte final ${sanitizeFileName(teamName)}.pdf`)
}