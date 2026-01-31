// src/components/AdminDashboard.tsx

"use client"

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react"
import Image from "next/image"
import { ThemeToggle } from "@/components/ThemeToggle"
import { createClient } from "@/utils/supabase/client"

/* -----------------------------
   Types
----------------------------- */
type DriverRow = {
  id: string
  first_name: string
  last_initial: string
  city: string
  state: string
  experience_years: number
  endorsements: string[]
  created_at: string
}

type Msg = { type: "success" | "error"; text: string } | null

interface InputProps {
  label: string
  placeholder: string
  value: string | number
  onChange: (val: string) => void
  type?: string
  maxLength?: number
}

interface DropdownProps {
  label?: string
  value: string
  options: { label: string; value: string }[]
  onChange: (val: string) => void
}

export default function AdminDashboard() {
  const supabase = createClient()

  /* -----------------------------
     Data state
  ----------------------------- */
  const [drivers, setDrivers] = useState<DriverRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<Msg>(null)

  /* -----------------------------
     Form state
  ----------------------------- */
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    city: "",
    state: "",
    experience_years: "",
    endorsements: "",
    driver_type: "company",
    dob: "", // DD/MM/YYYY
    living_city: "",
    living_state: "",
    phone: "",
    email: "",
    cdl_number: "",
    cdl_file: null as File | null,
  })

  /* -----------------------------
     Helpers
  ----------------------------- */
  const headerLinkClass =
    "text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"

  const handlePhoneChange = (val: string) => {
    // US format: +1 (XXX) XXX-XXXX
    const digits = val.replace(/\D/g, "")
    const d = digits.startsWith("1") ? digits.slice(1) : digits
    const limited = d.slice(0, 10)

    if (!limited) return setForm((p) => ({ ...p, phone: "" }))

    let formatted = `+1 (${limited.slice(0, 3)}`
    if (limited.length <= 3) {
      formatted = `+1 (${limited}`
    } else if (limited.length <= 6) {
      formatted = `+1 (${limited.slice(0, 3)}) ${limited.slice(3)}`
    } else {
      formatted = `+1 (${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`
    }

    setForm((p) => ({ ...p, phone: formatted }))
  }

  const loadDrivers = useCallback(async () => {
    setLoading(true)
    setMsg(null)

    const { data, error } = await supabase
      .from("drivers")
      .select("id, first_name, last_initial, city, state, experience_years, endorsements, created_at")
      .order("created_at", { ascending: false })

    if (error) setMsg({ type: "error", text: error.message })
    else setDrivers((data ?? []) as DriverRow[])

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadDrivers()
  }, [loadDrivers])

  /* -----------------------------
     Actions (Create / Delete)
  ----------------------------- */
  async function createDriver() {
    setMsg(null)
    setSubmitting(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const token = session?.access_token
    if (!token) {
      window.location.href = "/login"
      return
    }

    // endorsements: "Hazmat, Tanker" -> ["Hazmat","Tanker"]
    const endorsements = form.endorsements
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    // last initial from last name
    const lastInitial = form.last_name.trim().charAt(0).toUpperCase()

    // convert DD/MM/YYYY -> YYYY-MM-DD for DB
    let dbDate: string | null = null
    if (form.dob && form.dob.length === 10) {
      const [day, month, year] = form.dob.split("/")
      if (day && month && year) dbDate = `${year}-${month}-${day}`
    }

    const res = await fetch("/api/admin/driver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken: token,
        first_name: form.first_name,
        last_initial: lastInitial,
        city: form.city,
        state: form.state,
        experience_years: form.experience_years || "0",
        endorsements,
        driver_type: form.driver_type,
        dob: dbDate,
        living_city: form.living_city,
        living_state: form.living_state,
        phone: form.phone,
        email: form.email,
        cdl_number: form.cdl_number,
      }),
    })

    const json = await res.json()

    if (!res.ok) {
      setSubmitting(false)
      setMsg({ type: "error", text: json?.error ?? "Failed to create driver" })
      return
    }

    // optional CDL upload
    if (form.cdl_file) {
      const fd = new FormData()
      fd.append("accessToken", token)
      fd.append("driverId", json.id)
      fd.append("file", form.cdl_file)

      try {
        const upRes = await fetch("/api/admin/cdl-upload", { method: "POST", body: fd })
        const upJson = await upRes.json()
        if (!upRes.ok) setMsg({ type: "error", text: `Saved, but CDL upload failed: ${upJson?.error}` })
        else setMsg({ type: "success", text: "Driver created + CDL uploaded" })
      } catch {
        setMsg({ type: "error", text: "Saved, but CDL upload network error." })
      }
    } else {
      setMsg({ type: "success", text: "Driver created successfully" })
    }

    setSubmitting(false)

    // reset form
    setForm({
      first_name: "",
      last_name: "",
      city: "",
      state: "",
      experience_years: "",
      endorsements: "",
      driver_type: "company",
      dob: "",
      living_city: "",
      living_state: "",
      phone: "",
      email: "",
      cdl_number: "",
      cdl_file: null,
    })

    const fileInput = document.getElementById("cdl_file_input") as HTMLInputElement | null
    if (fileInput) fileInput.value = ""

    await loadDrivers()
  }

  async function deleteDriver(driverId: string) {
    const ok = confirm("Delete this driver? This cannot be undone.")
    if (!ok) return

    setMsg(null)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      window.location.href = "/login"
      return
    }

    const res = await fetch("/api/admin/driver", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: session.access_token, driverId }),
    })

    if (!res.ok) {
      const json = await res.json().catch(() => null)
      setMsg({ type: "error", text: json?.error ?? "Delete failed" })
      return
    }

    setMsg({ type: "success", text: "Driver deleted" })
    await loadDrivers()
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const totalCount = useMemo(() => drivers.length, [drivers])

  return (
    <main className="min-h-screen bg-white dark:bg-[#050505] text-zinc-900 dark:text-zinc-50 transition-colors duration-500">
      {/* subtle background like your landing page */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[900px] bg-gradient-to-b from-emerald-50/70 dark:from-emerald-950/25 to-transparent opacity-70" />
        <div className="absolute inset-0 hero-dots" />
      </div>

     

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* STATUS MESSAGE */}
        {msg && (
          <div
            className={[
              "mb-8 p-4 rounded-2xl border flex items-center gap-3 shadow-sm",
              msg.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-300",
            ].join(" ")}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${msg.type === "success" ? "bg-emerald-500" : "bg-red-500"}`} />
            <span className="font-semibold text-sm">{msg.text}</span>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: FORM */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black uppercase tracking-widest">Add Driver</h2>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                    Admin
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
                  Create a driver record. Sensitive fields stay private until unlocked.
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* PUBLIC */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                    Public profile
                  </h3>

                  <SelectDropdown
                    label="Driver Type"
                    value={form.driver_type}
                    options={[
                      { label: "Company Driver", value: "company" },
                      { label: "Owner Operator (O/O)", value: "owner_operator" },
                    ]}
                    onChange={(v) => setForm((p) => ({ ...p, driver_type: v }))}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="First Name"
                      placeholder="John"
                      value={form.first_name}
                      onChange={(v) => setForm((p) => ({ ...p, first_name: v }))}
                    />
                    <Input
                      label="Last Name"
                      placeholder="Doe"
                      value={form.last_name}
                      onChange={(v) => setForm((p) => ({ ...p, last_name: v }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="City (Work)"
                      placeholder="Dallas"
                      value={form.city}
                      onChange={(v) => setForm((p) => ({ ...p, city: v }))}
                    />
                    <Input
                      label="State (Work)"
                      placeholder="TX"
                      value={form.state}
                      maxLength={2}
                      onChange={(v) => setForm((p) => ({ ...p, state: v.toUpperCase() }))}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <Input
                        label="Exp (Yrs)"
                        placeholder="5"
                        type="number"
                        value={form.experience_years}
                        onChange={(v) => setForm((p) => ({ ...p, experience_years: v }))}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        label="Endorsements"
                        placeholder="Hazmat, Tanker"
                        value={form.endorsements}
                        onChange={(v) => setForm((p) => ({ ...p, endorsements: v }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

                {/* PRIVATE */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                      Locked data
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full">
                      Private
                    </span>
                  </div>

                  <CustomDatePicker
                    label="Date of Birth"
                    value={form.dob}
                    onChange={(v) => setForm((p) => ({ ...p, dob: v }))}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Living City"
                      placeholder="Austin"
                      value={form.living_city}
                      onChange={(v) => setForm((p) => ({ ...p, living_city: v }))}
                    />
                    <Input
                      label="Living State"
                      placeholder="TX"
                      value={form.living_state}
                      maxLength={2}
                      onChange={(v) => setForm((p) => ({ ...p, living_state: v.toUpperCase() }))}
                    />
                  </div>

                  <Input label="Phone" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handlePhoneChange} />
                  <Input
                    label="Email"
                    placeholder="driver@email.com"
                    value={form.email}
                    onChange={(v) => setForm((p) => ({ ...p, email: v }))}
                  />
                  <Input
                    label="CDL Number"
                    placeholder="A1234567"
                    value={form.cdl_number}
                    onChange={(v) => setForm((p) => ({ ...p, cdl_number: v }))}
                  />

                  <div>
                    <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">
                      Upload CDL
                    </label>
                    <input
                      id="cdl_file_input"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="block w-full text-sm text-zinc-600 dark:text-zinc-300
                      file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black
                      file:bg-zinc-900 file:text-white dark:file:bg-zinc-50 dark:file:text-black
                      hover:file:opacity-90 cursor-pointer
                      bg-white/70 dark:bg-zinc-950/40 rounded-xl border border-zinc-200 dark:border-zinc-800
                      focus:border-zinc-300 dark:focus:border-zinc-700 transition-all outline-none"
                      onChange={(e) => setForm((p) => ({ ...p, cdl_file: e.target.files?.[0] ?? null }))}
                    />
                  </div>
                </div>

                <button
                  onClick={createDriver}
                  disabled={submitting}
                  className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition
                    bg-zinc-900 text-white hover:opacity-90 active:scale-[0.99]
                    dark:bg-zinc-50 dark:text-black
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving..." : "Create Driver"}
                </button>
              </div>
            </div>
          </aside>

          {/* RIGHT: LIST */}
          <section className="lg:col-span-8">
            <div className="rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/60 backdrop-blur-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
                    System records
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="text-lg font-black tracking-tight">
                      Drivers <span className="text-zinc-500 dark:text-zinc-400">({totalCount})</span>
                    </h2>
                  </div>
                </div>

                <button
                  onClick={loadDrivers}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/40 text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300 hover:opacity-90 transition"
                >
                  Refresh
                </button>
              </div>

              {/* LOADING */}
              {loading ? (
                <div className="p-12 sm:p-16 text-center">
                  <div className="w-8 h-8 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-900 dark:border-t-zinc-200 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                    Loading drivers...
                  </p>
                </div>
              ) : (
                <>
                  {/* MOBILE: cards */}
                  <div className="block md:hidden p-4 space-y-3">
                    {drivers.map((d) => (
                      <div
                        key={d.id}
                        className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/40 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-base font-black">
                              {d.first_name} {d.last_initial}.
                            </div>
                            <div className="text-sm text-zinc-600 dark:text-zinc-300 font-semibold mt-1">
                              {d.city}, {d.state}
                            </div>
                            <div className="mt-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                              UUID: {d.id.slice(0, 8)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={`/drivers/${d.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest hover:opacity-90"
                            >
                              View
                            </a>
                            <button
                              onClick={() => deleteDriver(d.id)}
                              className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/15 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                            {d.experience_years}y exp
                          </span>
                          {Array.isArray(d.endorsements) &&
                            d.endorsements.slice(0, 3).map((e) => (
                              <span
                                key={e}
                                className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                              >
                                {e}
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* DESKTOP: table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-zinc-50/80 dark:bg-zinc-950/40 text-zinc-500 dark:text-zinc-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-zinc-200/60 dark:border-zinc-800/60">
                        <tr>
                          <th className="px-6 py-4">Identity</th>
                          <th className="px-6 py-4">Location</th>
                          <th className="px-6 py-4">Stats</th>
                          <th className="px-6 py-4 text-right">Ops</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                        {drivers.map((d) => (
                          <tr key={d.id} className="group hover:bg-zinc-50/70 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-black text-zinc-900 dark:text-white text-base">
                                {d.first_name} {d.last_initial}.
                              </div>
                              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mt-1">
                                UUID: {d.id.slice(0, 8)}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="text-zinc-700 dark:text-zinc-300 font-bold">
                                {d.city}, {d.state}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                                  {d.experience_years}y exp
                                </span>
                                {Array.isArray(d.endorsements) &&
                                  d.endorsements.slice(0, 2).map((e) => (
                                    <span
                                      key={e}
                                      className="px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                                    >
                                      {e}
                                    </span>
                                  ))}
                              </div>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <a
                                  href={`/drivers/${d.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest hover:opacity-90"
                                >
                                  View
                                </a>

                                <button
                                  onClick={() => deleteDriver(d.id)}
                                  className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/15 transition"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

/* -----------------------------
   Reusable Components
----------------------------- */

function Input({ label, placeholder, value, onChange, type = "text", maxLength }: InputProps) {
  return (
    <div>
      <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">
        {label}
      </label>
      <input
        type={type}
        maxLength={maxLength}
        className="w-full rounded-xl p-3 outline-none transition-all font-semibold
          bg-white/70 dark:bg-zinc-950/40
          border border-zinc-200 dark:border-zinc-800
          text-zinc-900 dark:text-white
          placeholder:text-zinc-400 dark:placeholder:text-zinc-500
          focus:border-zinc-300 dark:focus:border-zinc-700"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function SelectDropdown({ label = "Select", value, options, onChange }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", outside)
    return () => document.removeEventListener("mousedown", outside)
  }, [])

  const display = options.find((o) => o.value === value)?.label || "Select..."

  return (
    <div className="relative" ref={ref}>
      <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between rounded-xl p-3 font-semibold transition
          bg-white/70 dark:bg-zinc-950/40
          border border-zinc-200 dark:border-zinc-800
          text-zinc-900 dark:text-white
          hover:opacity-90"
      >
        {display}
        <svg
          className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-full rounded-xl shadow-xl z-50 overflow-hidden
          bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
              className={[
                "w-full text-left px-4 py-3 text-xs font-bold transition-colors",
                value === opt.value
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5",
              ].join(" ")}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function CustomDatePicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // click outside closes calendar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false)
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const pDate = (v: string) => {
    if (!v || v.length !== 10) return new Date()
    const [d, m, y] = v.split("/")
    return new Date(Number(y), Number(m) - 1, Number(d))
  }

  const [viewDate, setViewDate] = useState(pDate(value))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // DD/MM/YYYY (numbers only)
    let val = e.target.value.replace(/\D/g, "").slice(0, 8)
    if (val.length > 4) val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`
    else if (val.length > 2) val = `${val.slice(0, 2)}/${val.slice(2)}`
    onChange(val)
    if (val.length === 10) setViewDate(pDate(val))
  }

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const currentYear = viewDate.getFullYear()
  const currentMonth = viewDate.getMonth()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()

  return (
    <div className="relative" ref={ref}>
      <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">
        {label}
      </label>

      <div className="relative">
        <input
          type="text"
          className="w-full rounded-xl p-3 outline-none transition-all font-semibold
            bg-white/70 dark:bg-zinc-950/40
            border border-zinc-200 dark:border-zinc-800
            text-zinc-900 dark:text-white
            placeholder:text-zinc-400 dark:placeholder:text-zinc-500
            focus:border-zinc-300 dark:focus:border-zinc-700"
          placeholder="DD/MM/YYYY"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute top-full mt-2 left-0 w-[280px] rounded-2xl shadow-xl z-50 p-4
            bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), currentMonth - 1, 1))}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg text-zinc-500"
            >
              ←
            </button>
            <div className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">
              {months[currentMonth]} {currentYear}
            </div>
            <button
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), currentMonth + 1, 1))}
              className="p-1 hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg text-zinc-500"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {days.map((d) => (
              <div key={d} className="text-[9px] font-black text-zinc-500 dark:text-zinc-400">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={i} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1
              return (
                <button
                  key={i}
                  onClick={() => {
                    const dd = String(dayNum).padStart(2, "0")
                    const mm = String(currentMonth + 1).padStart(2, "0")
                    onChange(`${dd}/${mm}/${currentYear}`)
                    setIsOpen(false)
                  }}
                  className="h-8 w-8 text-[10px] font-black rounded-lg
                    hover:bg-zinc-100 dark:hover:bg-white/10
                    text-zinc-900 dark:text-white"
                >
                  {dayNum}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
