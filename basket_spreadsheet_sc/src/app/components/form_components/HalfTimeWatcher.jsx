"use client"
import { useEffect, useRef } from "react"
import { useMatchStore } from "../../utils/store/matchStore"

const ROWS_COUNT = 12 // debe coincidir con ROWS.length en RosterTable
const COACH_ROLES = ["coach", "assistantCoach"]

export default function HalftimeWatcher({ getValues, groups }) {
  const quarter = useMatchStore((state) => state.quarter)
  const captureHalftimeBoundary = useMatchStore((state) => state.captureHalftimeBoundary)

  const previousQuarterRef = useRef(quarter)
  const capturedRef = useRef(false)

  useEffect(() => {
    const previousQuarter = previousQuarterRef.current
    const justEnteredSecondHalf = previousQuarter === 2 && quarter === 3

    if (justEnteredSecondHalf && !capturedRef.current) {
      groups.forEach((group) => {
        for (let index = 0; index < ROWS_COUNT; index++) {
          const fouls = getValues(`${group}.players.${index}.fouls`) || []
          const filledCount = fouls.filter((f) => f && f !== "").length
          captureHalftimeBoundary(`${group}-${index}`, filledCount)
        }

        COACH_ROLES.forEach((role) => {
          const fouls = getValues(`${group}.${role}.fouls`) || []
          const filledCount = fouls.filter((f) => f && f !== "").length
          console.log(filledCount)
          captureHalftimeBoundary(`${group}-${role}`, filledCount)
        })
      })
      capturedRef.current = true
    }

    previousQuarterRef.current = quarter
  }, [quarter, groups, getValues, captureHalftimeBoundary])

  return null
}