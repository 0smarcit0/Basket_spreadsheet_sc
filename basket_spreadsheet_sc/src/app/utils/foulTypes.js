export const PLAYER_FOUL_CATEGORIES = [
  {
    title: "Personal (P)",
    options: [
      { value: "P", label: "P", sup: null },
      { value: "P1", label: "P", sup: "1" },
      { value: "P2", label: "P", sup: "2" },
      { value: "P3", label: "P", sup: "3" },
    ],
  },
  {
    title: "Técnica (T)",
    options: [{ value: "T1", label: "T", sup: "1" }],
  },
  {
    title: "Antideportiva (U)",
    options: [{ value: "U2", label: "U", sup: "2" }],
  },
  {
    title: "Descalificante (GD)",
    options: [{ value: "GD", label: "GD", sup: null }],
  },
]

export const COACH_FOUL_CATEGORIES = [
  {
    title: "Entrenador (C)",
    options: [{ value: "C", label: "C", sup: null }],
  },
  {
    title: "Banca (B)",
    options: [{ value: "B", label: "B", sup: null }],
  },
]