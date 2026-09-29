import { create } from "zustand"

export const useMatchStore = create((set, get) => ({
  quarter: 1,
  previousQuarter: 1,
  halftimeCaptured: false,
  gameEnded: false,
  teamAcurrentScore: 0,
  teamBcurrentScore: 0,
  numberCellNameA: "",
  ScoreCellNameA: "",
  numberCellNameB: "",
  ScoreCellNameB: "",


  increaseTeamAscore:(value, cellName)=>set((state)=>({
      numberCellNameA: cellName,
      ScoreCellNameA: cellName,
      teamAcurrentScore: state.teamAcurrentScore+value
  })),
  increaseTeamBscore:(value, cellName)=>set((state)=>({
      numberCellNameB: cellName,
      ScoreCellNameB: cellName,
      teamBcurrentScore: state.teamBcurrentScore+value
  })),
  increaseQuarter: ()=>
    set((state)=>({
      previousQuarter: state.quarter,
      quarter: state.quarter+1
    })),

  setQuarter: (q) =>
    set((state) => ({
      previousQuarter: state.quarter,
      quarter: q,
    })),

  halftimeBoundaries: {},

  captureHalftimeBoundary: (playerKey, filledCount) =>
    set((state) => ({
      halftimeBoundaries: {
        ...state.halftimeBoundaries,
        [playerKey]: filledCount,
      },
    })),

  markHalftimeCaptured: () => set({ halftimeCaptured: true }),

  resetHalftimeBoundaries: () =>
    set({ halftimeBoundaries: {}, halftimeCaptured: false }),
}))