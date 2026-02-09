// src/components/navigation-loader.tsx
"use client"

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import Link, { LinkProps } from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

type NavLoaderCtx = {
  isNavigating: boolean
  start: () => void
  stop: () => void
}

const Ctx = createContext<NavLoaderCtx | null>(null)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)

  const fallbackTimer = useRef<number | null>(null)
  const lastSearchRef = useRef<string>("")

  const value = useMemo(
    () => ({
      isNavigating,
      start: () => {
        setIsNavigating(true)

        // safety fallback: if navigation doesn't change URL, stop after 10s
        if (fallbackTimer.current) window.clearTimeout(fallbackTimer.current)
        fallbackTimer.current = window.setTimeout(() => setIsNavigating(false), 10_000)
      },
      stop: () => {
        setIsNavigating(false)
        if (fallbackTimer.current) window.clearTimeout(fallbackTimer.current)
      },
    }),
    [isNavigating]
  )

  // Stop loader when pathname changes (navigation complete)
  useEffect(() => {
    setIsNavigating(false)
    if (fallbackTimer.current) window.clearTimeout(fallbackTimer.current)
  }, [pathname])

  // Also stop loader when ONLY the query string changes (without Next's useSearchParams)
  useEffect(() => {
    // initialize
    lastSearchRef.current = typeof window !== "undefined" ? window.location.search : ""

    const tick = () => {
      const current = window.location.search
      if (current !== lastSearchRef.current) {
        lastSearchRef.current = current
        setIsNavigating(false)
        if (fallbackTimer.current) window.clearTimeout(fallbackTimer.current)
      }
    }

    // lightweight polling only while navigating, otherwise do nothing
    if (!isNavigating) return
    const id = window.setInterval(tick, 150)
    return () => window.clearInterval(id)
  }, [isNavigating])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useNavigationLoader() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useNavigationLoader must be used inside <NavigationProvider />")
  return ctx
}

/** Use this instead of <Link> when you want loader */
export function NavLink({
  href,
  onClick,
  children,
  ...props
}: LinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode
  }) {
  const { start } = useNavigationLoader()

  return (
    <Link
      href={href}
      {...props}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        start()
      }}
    >
      {children}
    </Link>
  )
}


/** Helper for router.push with loader */
export function useNavPush() {
  const router = useRouter()
  const { start } = useNavigationLoader()

  return (href: string) => {
    start()
    router.push(href)
  }
}

export function RouteLoader() {
  const { isNavigating } = useNavigationLoader()

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] pointer-events-none"
        >
          <div className="absolute top-0 left-0 right-0 h-[3px] overflow-hidden bg-transparent">
            <motion.div
              className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
