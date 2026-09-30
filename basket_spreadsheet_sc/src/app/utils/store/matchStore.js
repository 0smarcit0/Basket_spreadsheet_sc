import { create } from "zustand"

export const useMatchStore = create((set, get) => ({
  quarter: 0,
  previousQuarter: 0,
  halftimeCaptured: false,
  gameEnded: false,
  teamAcurrentScore: 0,
  teamBcurrentScore: 0,
  numberCellNameA: "",
  ScoreCellNameA: "",
  numberCellNameB: "",
  ScoreCellNameB: "",
  scoredStackA: [],
  scoredStackB: [],

  increaseTeamAscore: (value, cellName) => set((state) => {
    const newScore = state.teamAcurrentScore + value;
    return {
      numberCellNameA: cellName,
      ScoreCellNameA: cellName,
      teamAcurrentScore: newScore,
      scoredStackA: [...state.scoredStackA, newScore],
    };
  }),
  increaseTeamBscore: (value, cellName) => set((state) => {
    const newScore = state.teamBcurrentScore + value;
    return {
      numberCellNameB: cellName,
      ScoreCellNameB: cellName,
      teamBcurrentScore: newScore,
      scoredStackB: [...state.scoredStackB, newScore],
    };
  }),

  undoTeamAscore: () => set((state) => {
    const stack = state.scoredStackA.slice(0, -1);
    return {
      scoredStackA: stack,
      teamAcurrentScore: stack.length ? stack[stack.length - 1] : 0,
    };
  }),
  undoTeamBscore: () => set((state) => {
    const stack = state.scoredStackB.slice(0, -1);
    return {
      scoredStackB: stack,
      teamBcurrentScore: stack.length ? stack[stack.length - 1] : 0,
    };
  }),
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