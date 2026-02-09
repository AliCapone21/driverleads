// src/app/about/page.tsx
"use client"

import React, { Suspense } from "react"
import AboutContent from "@/components/AboutContent"

export default function AboutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-[#060607] flex items-center justify-center">
        <div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
      </div>
    }>
      <AboutContent />
    </Suspense>
  )
}