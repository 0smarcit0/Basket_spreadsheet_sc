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
    options: [{ value: "T", label: "T", sup: null }
      ,{ value: "T1", label: "T", sup: "1" },
      {value: "T2", label: "T", sup: "2" },],
  },
  {
    title: "Antideportiva (U)",
    options: [ { value: "U", label: "U", sup: null },
      { value: "U1", label: "U", sup: "1" },
      { value: "U2", label: "U", sup: "2" }, 
      { value: "U3", label: "U", sup: "3" }],
  },
  {
    title: "Descalificante (D)",
    options: [{ value: "D", label: "D", sup: null },
               {value: "D1", label: "D", sup: "1"},
               {value: "D2", label: "D", sup: "2"},
               {value: "D3", label: "D", sup: "3"}
    ],
  },
  {
    title:"Descalificante por enfrentamiento (F)",
    options: [{ value: "F", label: "F", sup: null }],
  },
  {
    title: "Descalificacion del partido (GD)",
    options: [{ value: "GD", label: "GD", sup: null }],
  },
  {
    title: "Canceladas",
    options: [{ value: "PC", label: "P", sup: "C" },
              {value: "TC", label: "T", sup: "C"},
              {value: "UC", label: "U", sup: "C"},
              {value: "DC", label: "D", sup: "C"}
    ],
  }
]

export const COACH_FOUL_CATEGORIES = [
  {
    title: "Entrenador (C)",
    options: [{ value: "C", label: "C", sup: null },
              {value: "C1", label: "C", sup: "1"},
              {value: "C2", label: "C", sup: "2"},
    ],
  },
  {
    title: "Descalificante (D)",
    options: [{ value: "D", label: "D", sup: null },
               {value: "D1", label: "D", sup: "1"},
               {value: "D2", label: "D", sup: "2"},
               {value: "D3", label: "D", sup: "3"}
    ],
  },
  {
    title:"Descalificante por enfrentamiento (F)",
    options: [{ value: "F", label: "F", sup: null }],
  },
  {
    title: "Banca (B)",
    options: [{ value: "B", label: "B", sup: null },
              {value: "B1", label: "B", sup: "1"},
              {value: "B2", label: "B", sup: "2"},
    ],
  },
]