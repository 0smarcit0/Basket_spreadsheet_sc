import { create } from "zustand"

export const useMatchStore = create((set, get) => ({
  quarter: 1,
  previousQuarter: 1,
  halftimeCaptured: false,
  gameEnded: false,

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