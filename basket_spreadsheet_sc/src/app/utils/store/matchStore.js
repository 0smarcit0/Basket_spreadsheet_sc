import { create } from "zustand"

const markLastScored = (state, q) => {
  const next = { A: { ...state.endMarks.A }, B: { ...state.endMarks.B } };
  const a = state.teamAcurrentScore;
  const b = state.teamBcurrentScore;
  if (a > 0 && next.A[a] === undefined) next.A[a] = q;
  if (b > 0 && next.B[b] === undefined) next.B[b] = q;
  return next;
};

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
  endMarks: { A: {}, B: {} }, 
  finalRow: { A: null, B: null },

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
   increaseQuarter: () =>
    set((state) => ({
      previousQuarter: state.quarter,
      quarter: state.quarter + 1,
      
      endMarks: state.quarter > 0 ? markLastScored(state, state.quarter) : state.endMarks,
    })),

  setQuarter: (q) =>
    set((state) => ({
      previousQuarter: state.quarter,
      quarter: q,
      endMarks:
        state.quarter > 0 && q > state.quarter
          ? markLastScored(state, state.quarter)
          : state.endMarks,
      halftimeCaptured:
        state.halftimeCaptured || (state.quarter === 2 && q === 3),
    })),

  endGame: () =>
    set((state) => ({
      gameEnded: true,
      endMarks: state.quarter > 0 ? markLastScored(state, state.quarter) : state.endMarks,
      finalRow: {
        A: state.teamAcurrentScore || null,
        B: state.teamBcurrentScore || null,
      },
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