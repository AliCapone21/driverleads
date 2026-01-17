"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

/* --- Types & Helpers --- */
type DriverRow = {
  id: string
  first_name: string
  last_initial: string
  city: string
  state: string
  living_city: string | null
  living_state: string | null
  dob: string | null
  driver_type: "company" | "owner_operator"
  experience_years: number
  endorsements: string[]
  created_at: string
}

type TabType = "all" | "available" | "unlocked"

function calcAge(dob: string | null) {
  if (!dob) return null
  const birth = new Date(dob)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function typeLabel(t: "company" | "owner_operator") {
  return t === "owner_operator" ? "Owner Operator" : "Company Driver"
}

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

export default function DriversClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [drivers, setDrivers] = useState<DriverRow[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  // Tab State
  const initialTab = (searchParams.get("tab") as TabType) || "all"
  const [activeTab, setActiveTab] = useState<TabType>(initialTab)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  // Filters
  const [typeFilter, setTypeFilter] = useState<"all" | "company" | "owner_operator">("all")
  const [minExp, setMinExp] = useState<number>(0)
  const [ageMin, setAgeMin] = useState<string>("")
  const [ageMax, setAgeMax] = useState<string>("")
  const [sortBy, setSortBy] = useState<"newest" | "exp_desc" | "age_asc" | "age_desc">("newest")
  const [showFilters, setShowFilters] = useState(false)

  // URL Sync
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`?${params.toString()}`, { scroll: false })
    setCurrentPage(1)
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [typeFilter, minExp, ageMin, ageMax, query, sortBy])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      const { data: sessionData } = await supabase.auth.getSession()
      setSessionEmail(sessionData.session?.user.email ?? null)
      const userId = sessionData.session?.user.id

      if (userId) {
        const { data: unlockRows } = await supabase.from("unlocks").select("driver_id").eq("user_id", userId)
        setUnlockedIds(new Set((unlockRows ?? []).map((r) => r.driver_id)))
      }

      const { data, error } = await supabase
        .from("drivers")
        .select(
          "id, first_name, last_initial, city, state, living_city, living_state, dob, driver_type, experience_years, endorsements, created_at"
        )
        .order("created_at", { ascending: false })

      if (error) setError(error.message)
      else setDrivers(data ?? [])

      setLoading(false)
    }
    load()
  }, [])

  // Filter Logic
  const filtered = useMemo(() => {
    let list = drivers

    if (activeTab === "unlocked") list = list.filter((d) => unlockedIds.has(d.id))
    else if (activeTab === "available") list = list.filter((d) => !unlockedIds.has(d.id))

    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((d) => {
        const blob =
          `${d.first_name} ${d.last_initial} ${d.city} ${d.state} ${d.living_city} ${d.living_state} ${(d.endorsements ?? []).join(
            " "
          )}`.toLowerCase()
        return blob.includes(q)
      })
    }

    if (typeFilter !== "all") list = list.filter((d) => d.driver_type === typeFilter)
    if (minExp > 0) list = list.filter((d) => (d.experience_years ?? 0) >= minExp)

    const minAgeNum = ageMin.trim() ? Number(ageMin) : null
    const maxAgeNum = ageMax.trim() ? Number(ageMax) : null
    if (minAgeNum !== null) list = list.filter((d) => (calcAge(d.dob) ?? 0) >= minAgeNum)
    if (maxAgeNum !== null) list = list.filter((d) => (calcAge(d.dob) ?? 0) <= maxAgeNum)

    const sorted = [...list]
    if (sortBy === "exp_desc") sorted.sort((a, b) => (b.experience_years ?? 0) - (a.experience_years ?? 0))
    else if (sortBy === "age_asc") sorted.sort((a, b) => (calcAge(a.dob) ?? 999) - (calcAge(b.dob) ?? 999))
    else if (sortBy === "age_desc") sorted.sort((a, b) => (calcAge(b.dob) ?? 0) - (calcAge(a.dob) ?? 0))
    else sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return sorted
  }, [drivers, unlockedIds, activeTab, query, typeFilter, minExp, ageMin, ageMax, sortBy])

  // Pagination Logic
  const totalItems = filtered.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const paginatedDrivers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  const activeFiltersCount =
    (typeFilter !== "all" ? 1 : 0) + (minExp > 0 ? 1 : 0) + (ageMin || ageMax ? 1 : 0) + (sortBy !== "newest" ? 1 : 0)

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <main className="min-h-screen bg-[#070A12] text-slate-100 relative font-sans selection:bg-white selection:text-black pb-20">
      {/* Cinematic Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[820px] h-[820px] rounded-full blur-[140px] opacity-40 bg-indigo-500/20" />
        <div className="absolute -bottom-44 -left-44 w-[720px] h-[720px] rounded-full blur-[140px] opacity-40 bg-cyan-500/15" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_45%),radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.04),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-black/30 ring-1 ring-white/10">
                DL
              </div>
              <span className="font-bold tracking-tight hidden sm:block text-white/90">Driver Leads</span>
            </a>
            <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" />
            <h1 className="font-medium text-white/55 text-sm">Marketplace</h1>
          </div>

          <div className="flex items-center gap-3">
            {sessionEmail ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-white/55 hidden sm:block">{sessionEmail}</span>
                <button
                  onClick={signOut}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:text-red-300 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="text-sm font-semibold bg-white text-black px-5 py-2 rounded-xl hover:bg-white/90 transition-all shadow-md shadow-black/30"
              >
                Login
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Controls - Fixed Glassmorphism background */}
        <div className="sticky top-16 z-30 py-4 -mx-4 px-4 bg-[#070A12]/85 backdrop-blur-xl border-b border-white/10 space-y-4 mb-8 transition-all">
          {/* Tabs */}
          <div className="relative w-fit">
            <div className="flex p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm shadow-black/20 ring-1 ring-white/5">
              {(["all", "available", "unlocked"] as TabType[]).map((tab) => {
                const isActive = activeTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                      isActive ? "text-black" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="tab-pill"
                        className="absolute inset-0 rounded-xl bg-white shadow-lg shadow-black/30"
                        transition={{ duration: 0.5, ease }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      {tab === "all" && "All Drivers"}
                      {tab === "available" && "Available"}
                      {tab === "unlocked" && (
                        <>
                          Unlocked
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                              isActive ? "bg-black/10 text-black" : "bg-white/10 text-white/70"
                            }`}
                          >
                            {unlockedIds.size}
                          </span>
                        </>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col gap-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-white/40 group-focus-within:text-white transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/35 focus:ring-2 focus:ring-white/25 focus:border-white/20 outline-none transition-all shadow-sm shadow-black/30"
                placeholder="Search by city, state, or endorsement..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 relative">
              <FilterDropdown
                label={typeFilter === "all" ? "All Types" : typeLabel(typeFilter)}
                active={typeFilter !== "all"}
                options={[
                  { label: "All Types", value: "all" },
                  { label: "Company Driver", value: "company" },
                  { label: "Owner Operator", value: "owner_operator" },
                ]}
                onSelect={(val) => setTypeFilter(val as any)}
              />

              <FilterDropdown
                label={minExp > 0 ? `${minExp}+ Years Exp` : "Experience"}
                active={minExp > 0}
                options={[
                  { label: "Any Experience", value: 0 },
                  { label: "1+ Years", value: 1 },
                  { label: "3+ Years", value: 3 },
                  { label: "5+ Years", value: 5 },
                ]}
                onSelect={(val) => setMinExp(Number(val))}
              />

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all whitespace-nowrap shadow-sm shadow-black/20 ${
                  ageMin || ageMax
                    ? "bg-white text-black border-white/20"
                    : "bg-white/5 text-white/70 border-white/10 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                {ageMin || ageMax ? `Age: ${ageMin || "0"}-${ageMax || "∞"}` : "Age Range"}
              </button>

              <FilterDropdown
                label={
                  sortBy === "newest"
                    ? "Newest"
                    : sortBy === "exp_desc"
                    ? "Most Exp"
                    : sortBy === "age_asc"
                    ? "Youngest"
                    : "Oldest"
                }
                active={sortBy !== "newest"}
                options={[
                  { label: "Newest First", value: "newest" },
                  { label: "Experience (High-Low)", value: "exp_desc" },
                  { label: "Age (Low-High)", value: "age_asc" },
                  { label: "Age (High-Low)", value: "age_desc" },
                ]}
                onSelect={(val) => setSortBy(val as any)}
              />

              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    setTypeFilter("all")
                    setMinExp(0)
                    setAgeMin("")
                    setAgeMax("")
                    setSortBy("newest")
                    setQuery("")
                  }}
                  className="ml-auto px-4 py-2.5 text-xs font-bold text-red-300 hover:bg-red-500/10 rounded-xl transition-colors whitespace-nowrap"
                >
                  Reset Filter
                </button>
              )}

              {/* Age Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ duration: 0.45, ease }}
                    className="bg-black/70 border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/50 backdrop-blur-xl flex items-end gap-3 max-w-md absolute top-[105%] left-0 z-50"
                  >
                    <div className="w-1/2">
                      <label className="block text-[10px] font-bold text-white/45 uppercase mb-1.5">Min Age</label>
                      <input
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:ring-2 focus:ring-white/25 outline-none"
                        value={ageMin}
                        onChange={(e) => setAgeMin(e.target.value)}
                        placeholder="18"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-[10px] font-bold text-white/45 uppercase mb-1.5">Max Age</label>
                      <input
                        type="number"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:ring-2 focus:ring-white/25 outline-none"
                        value={ageMax}
                        onChange={(e) => setAgeMax(e.target.value)}
                        placeholder="65"
                      />
                    </div>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-5 py-2 bg-white text-black rounded-lg text-sm font-extrabold shadow-lg shadow-black/40 hover:bg-white/90 transition-colors"
                    >
                      Apply
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-xs text-white/55 font-medium uppercase tracking-wider">
            Showing {paginatedDrivers.length} of {totalItems} Drivers
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease }} className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-200"
          >
            <p className="font-bold">Unable to load drivers</p>
            <p className="text-sm mt-1 text-red-200/80">{error}</p>
          </motion.div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center"
          >
            <p className="text-white/70 font-medium">No drivers match your criteria.</p>
            {activeTab === "unlocked" && <p className="text-sm text-white/45 mt-1">You haven't unlocked any drivers yet.</p>}
          </motion.div>
        ) : (
          <motion.div layout className="grid gap-5">
            <AnimatePresence initial={false} mode="popLayout">
              {paginatedDrivers.map((d) => (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 14, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.99 }}
                  transition={{ duration: 0.55, ease }}
                >
                  <DriverCard data={d} isUnlocked={unlockedIds.has(d.id)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-black/30"
            >
              <svg className="w-5 h-5 text-white/75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="text-sm font-medium text-white/60">
              Page <span className="text-white font-extrabold">{currentPage}</span> of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-black/30"
            >
              <svg className="w-5 h-5 text-white/75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        )}
      </div>
    </main>
  )
}

/* --- Premium Driver Card (Dark) --- */
function DriverCard({ data, isUnlocked }: { data: DriverRow; isUnlocked: boolean }) {
  return (
    <motion.a
      href={`/drivers/${data.id}`}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.8, ease }}
      className="group relative block rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm shadow-black/30 hover:bg-white/7 hover:border-white/20 hover:shadow-xl hover:shadow-black/40 overflow-hidden backdrop-blur-xl"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isUnlocked ? "bg-emerald-400" : "bg-white"}`} />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[radial-gradient(600px_circle_at_20%_10%,rgba(255,255,255,0.10),transparent_55%)]" />

      <div className="flex flex-col md:flex-row gap-6 items-start justify-between pl-2 relative">
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-extrabold text-white tracking-tight group-hover:text-white transition-colors">
                {data.first_name} {data.last_initial}.
              </h3>
              {isUnlocked && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-400/10 text-emerald-200 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-400/20">
                  Unlocked
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wide border ${
                  data.driver_type === "owner_operator"
                    ? "bg-indigo-400/10 border-indigo-400/20 text-indigo-200"
                    : "bg-white/5 border-white/10 text-white/70"
                }`}
              >
                {typeLabel(data.driver_type)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-white/10">
            <div className="space-y-0.5">
              <div className="text-[10px] font-extrabold text-white/45 uppercase">Location</div>
              <div className="text-sm font-semibold text-white/80 truncate">
                {(data.living_city ?? data.city)}, {(data.living_state ?? data.state)}
              </div>
            </div>
            <div className="space-y-0.5 border-l border-white/10 pl-3">
              <div className="text-[10px] font-extrabold text-white/45 uppercase">Experience</div>
              <div className="text-sm font-semibold text-white/80">{data.experience_years} Years</div>
            </div>
            <div className="space-y-0.5 border-l border-white/10 pl-3">
              <div className="text-[10px] font-extrabold text-white/45 uppercase">Age</div>
              <div className="text-sm font-semibold text-white/80">{calcAge(data.dob) ?? "N/A"}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(data.endorsements ?? []).slice(0, 4).map((e) => (
              <span
                key={e}
                className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white/75"
              >
                {e}
              </span>
            ))}
            {(data.endorsements?.length ?? 0) > 4 && (
              <span className="text-xs font-medium text-white/45 px-1 self-center">+{data.endorsements.length - 4} more</span>
            )}
          </div>
        </div>

        <div className="w-full md:w-auto mt-2 md:mt-0 flex flex-col items-end justify-center h-full">
          {isUnlocked ? (
            <div className="w-full md:w-auto px-6 py-3 bg-emerald-400/10 border border-emerald-400/20 rounded-xl text-emerald-100 text-sm font-extrabold flex items-center justify-center gap-2 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              View Profile
            </div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.6, ease }}
              className="w-full md:w-auto px-6 py-3 bg-white text-black rounded-xl text-sm font-extrabold shadow-lg shadow-black/40 flex items-center justify-center gap-2"
            >
              <span>Unlock</span>
              <span className="bg-black/10 px-1.5 py-0.5 rounded text-xs">$10</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.a>
  )
}

/* --- Custom Filter Dropdown (Dark + Smooth) --- */
function FilterDropdown({
  label,
  options,
  onSelect,
  active,
}: {
  label: string
  options: { label: string; value: string | number }[]
  onSelect: (val: string | number) => void
  active: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-extrabold transition-all whitespace-nowrap shadow-sm shadow-black/20 ${
          active ? "bg-white text-black border-white/20" : "bg-white/5 text-white/70 border-white/10 hover:border-white/20 hover:bg-white/10"
        }`}
      >
        {label}
        <svg className={`w-3 h-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.45, ease }}
            className="absolute top-full mt-2 left-0 w-52 bg-black/70 border border-white/10 rounded-xl shadow-2xl shadow-black/60 z-50 overflow-hidden backdrop-blur-xl"
          >
            <div className="py-1">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onSelect(opt.value)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-white/75 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm shadow-black/30 animate-pulse flex items-center justify-between backdrop-blur-xl">
      <div className="space-y-4 w-full">
        <div className="h-6 bg-white/10 rounded w-1/3" />
        <div className="flex gap-4">
          <div className="h-10 bg-white/10 rounded w-20" />
          <div className="h-10 bg-white/10 rounded w-20" />
          <div className="h-10 bg-white/10 rounded w-20" />
        </div>
        <div className="flex gap-2 mt-2">
          <div className="h-6 bg-white/10 rounded w-16" />
          <div className="h-6 bg-white/10 rounded w-16" />
        </div>
      </div>
      <div className="h-12 w-32 bg-white/10 rounded-xl" />
    </div>
  )
}