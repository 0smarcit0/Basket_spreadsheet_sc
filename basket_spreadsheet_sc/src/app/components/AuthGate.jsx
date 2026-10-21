"use client"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { isAuthorized } from "../utils/auth/auth"

const normalize = (p) => (p.length > 1 ? p.replace(/\/$/, "") : p)

export default function AuthGate({ children }) {
  const router = useRouter()
  const pathname = normalize(usePathname())
  const [allowedPath, setAllowedPath] = useState(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const authed = await isAuthorized()
      if (cancelled) return
      const isLogin = pathname === "/login"

      if (!authed && !isLogin) router.replace("/login")
      else if (authed && isLogin) router.replace("/")
      else setAllowedPath(pathname)
    })()

    return () => { cancelled = true }
  }, [pathname, router])

  if (allowedPath !== pathname) return null
  return children
}