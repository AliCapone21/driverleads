// src/components/JoinClient.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/ThemeToggle"

const ease = [0.22, 1, 0.36, 1] as const

export default function JoinClient() {
  const router = useRouter()
  const supabase = createClient()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [step1Attempted, setStep1Attempted] = useState(false)
  const [step2Attempted, setStep2Attempted] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    city: "",
    state: "",
    cdl_city: "",
    cdl_state: "",
    phone: "",
    cdl_number: "",
    age: "",
    experience_years: "",
    endorsements: "",
    driver_type: "company" as "company" | "owner_operator",
    isConfidential: false,
    cdl_file: null as File | null,

    // ✅ Salary expectations (stored on drivers table)
    expected_gross: "", // owner_operator (number)
    expected_rpm: "", // owner_operator (number, e.g. 1.25)
    expected_cpm: "", // company (number, cents)
    expected_miles: "", // company (number)
  })

  /* --- Validation --- */
  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email)

  // CDL number (US varies by state). We'll accept 6–12 alphanumeric, uppercase, ignore separators.
  const normalizeCdl = (v: string) => v.toUpperCase().replace(/[^A-Z0-9]/g, "")
  const isValidCdlNumber = (v: string) => /^[A-Z0-9]{6,12}$/.test(normalizeCdl(v))

  const isStep1Valid =
    !!formData.first_name &&
    !!formData.last_name &&
    isValidEmail(formData.email) &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword

  const isOwner = formData.driver_type === "owner_operator"

  // numeric helpers
  const toNumOrNull = (v: string) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  const isNonNegativeNumber = (v: string) => {
    if (v === "") return false
    const n = Number(v)
    return Number.isFinite(n) && n >= 0
  }

  const salaryValid = isOwner
    ? isNonNegativeNumber(formData.expected_gross) && isNonNegativeNumber(formData.expected_rpm)
    : isNonNegativeNumber(formData.expected_cpm) && isNonNegativeNumber(formData.expected_miles)

  const isStep2Valid =
    !!formData.city &&
    !!formData.state &&
    !!formData.cdl_city &&
    !!formData.cdl_state &&
    formData.phone.length >= 17 &&
    formData.experience_years !== "" &&
    formData.age !== "" &&
    isValidCdlNumber(formData.cdl_number) &&
    salaryValid &&
    formData.isConfidential

  const stepTitle = useMemo(() => (step === 1 ? "Create your account" : "Driver profile details"), [step])

  const handleNextStep = () => {
    setStep1Attempted(true)
    if (isStep1Valid) {
      setStep(2)
      setError(null)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const digits = val.replace(/\D/g, "")
    let formatted = ""
    if (digits.length > 0) {
      const d = digits.startsWith("1") ? digits.slice(1) : digits
      const limited = d.slice(0, 10)
      if (limited.length <= 3) formatted = `+1 (${limited}`
      else if (limited.length <= 6) formatted = `+1 (${limited.slice(0, 3)}) ${limited.slice(3)}`
      else formatted = `+1 (${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`
    }
    setFormData({ ...formData, phone: formatted })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked })
    } else if (type === "file") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).files?.[0] || null })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleCdlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = normalizeCdl(e.target.value).slice(0, 12)
    setFormData((p) => ({ ...p, cdl_number: cleaned }))
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep2Attempted(true)
    if (!isStep2Valid) return

    setLoading(true)
    setError(null)

    try {
      // 1) Auth SignUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })
      if (authError) throw authError
      if (!authData.user) throw new Error("Registration failed.")

      // 2) Prepare data
      const endsArray = formData.endorsements
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "")

      // Calculate a DOB from age (Jan 1 of birth year)
      const calculatedDob = new Date(new Date().getFullYear() - Number(formData.age), 0, 1)
        .toISOString()
        .split("T")[0]

      // ✅ expectations (store null if parsing fails)
      const expectedGross = isOwner ? toNumOrNull(formData.expected_gross) : null
      const expectedRpm = isOwner ? toNumOrNull(formData.expected_rpm) : null
      const expectedCpm = !isOwner ? toNumOrNull(formData.expected_cpm) : null
      const expectedMiles = !isOwner ? toNumOrNull(formData.expected_miles) : null

      // 3) Insert public profile
      const { data: driver, error: drvErr } = await supabase
        .from("drivers")
        .insert({
          user_id: authData.user.id,
          first_name: formData.first_name,
          last_initial: formData.last_name, // storing full surname in last_initial
          city: formData.cdl_city,
          state: formData.cdl_state,
          living_city: formData.city,
          living_state: formData.state,
          experience_years: Number(formData.experience_years),
          endorsements: endsArray,
          driver_type: formData.driver_type,
          status: "active",
          dob: calculatedDob,

          // ✅ NEW fields
          expected_gross: expectedGross,
          expected_rpm: expectedRpm,
          expected_cpm: expectedCpm,
          expected_miles: expectedMiles,
        })
        .select()
        .single()

      if (drvErr) throw drvErr

      // 4) Insert private info
      const { error: privErr } = await supabase.from("driver_private").insert({
        driver_id: driver.id,
        email: formData.email,
        phone: formData.phone,
        cdl_number: normalizeCdl(formData.cdl_number),
      })
      if (privErr) throw privErr

      // 5) Upload optional CDL file
      if (formData.cdl_file) {
        const fileExt = formData.cdl_file.name.split(".").pop()
        const path = `${driver.id}/cdl_doc.${fileExt}`
        await supabase.storage.from("cdls").upload(path, formData.cdl_file)
      }

      router.refresh()
      router.push("/drivers/dashboard")
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const salaryHint = isOwner
    ? "Owner-Operator expectations help carriers match you faster."
    : "Company expectations help recruiters send accurate offers."

  return (
    <main className="min-h-screen relative overflow-hidden bg-white text-zinc-900 dark:bg-[#070A12] dark:text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* light */}
        <div className="absolute top-[-25%] right-[-12%] w-[900px] h-[900px] bg-indigo-600/15 rounded-full blur-[140px] dark:hidden" />
        <div className="absolute bottom-[-25%] left-[-12%] w-[900px] h-[900px] bg-emerald-600/15 rounded-full blur-[140px] dark:hidden" />
        <div
          className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)] [background-size:48px_48px] dark:hidden"
        />

        {/* dark */}
        <div className="absolute top-[-25%] right-[-12%] w-[900px] h-[900px] bg-indigo-600/10 rounded-full blur-[140px] hidden dark:block" />
        <div className="absolute bottom-[-25%] left-[-12%] w-[900px] h-[900px] bg-emerald-600/10 rounded-full blur-[140px] hidden dark:block" />
        <div
          className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:48px_48px] hidden dark:block"
        />
      </div>

      {/* Top bar */}
      <div className="relative z-20">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-15 w-30 scale-300 transition-transform duration-300 group-hover:scale-[3.7]">
              <Image src="/logo3.png" alt="Driver Leads" fill priority className="object-contain" />
            </div>
            <span className="sr-only">Driver Leads</span>
          </Link>

          <div className="flex items-center gap-3">
            {mounted && <ThemeToggle />}
            <Link
              href="/login"
              className="text-xs font-bold px-4 py-2 rounded-xl bg-zinc-100/80 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10
                         text-zinc-700 dark:text-white/75 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="w-full max-w-xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
              Join Driver Leads
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-white/55">
              {stepTitle} • Step {step} of 2
            </p>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-1.5 flex-1 rounded-full overflow-hidden bg-zinc-200/70 dark:bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: step >= i ? "100%" : "0%" }}
                  transition={{ duration: 0.55, ease }}
                  className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]"
                />
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="rounded-[28px] bg-white/85 dark:bg-zinc-900/55 backdrop-blur-xl border border-zinc-200/70 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
            <div className="px-6 sm:px-8 py-6 border-b border-zinc-200/60 dark:border-white/10 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300/80">
                  Secure onboarding
                </span>
                <span className="text-sm font-extrabold text-zinc-800 dark:text-white/85">
                  {step === 1 ? "Account" : "Professional details"}
                </span>
              </div>

              <div className="text-[11px] font-semibold text-zinc-500 dark:text-white/50">
                Already registered?{" "}
                <Link href="/login" className="font-bold text-emerald-700 dark:text-emerald-300 hover:underline">
                  Sign in
                </Link>
              </div>
            </div>

            <form onSubmit={handleJoin} className="px-6 sm:px-8 py-7">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 14 }}
                    transition={{ duration: 0.4, ease }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="First name"
                        name="first_name"
                        placeholder="John"
                        value={formData.first_name}
                        onChange={handleChange}
                        isError={step1Attempted && !formData.first_name}
                      />
                      <Input
                        label="Surname"
                        name="last_name"
                        placeholder="Doe"
                        value={formData.last_name}
                        onChange={handleChange}
                        isError={step1Attempted && !formData.last_name}
                      />
                    </div>

                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      isError={step1Attempted && !isValidEmail(formData.email)}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="relative">
                        <Input
                          label="Create password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 8 characters"
                          value={formData.password}
                          onChange={handleChange}
                          isError={step1Attempted && formData.password.length < 8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 bottom-[14px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>

                      <div className="relative">
                        <Input
                          label="Confirm password"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          isError={step1Attempted && formData.password !== formData.confirmPassword}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 bottom-[14px] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                          aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        >
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full py-4 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black
                                   font-black uppercase tracking-[0.18em] text-xs hover:opacity-90 transition-all active:scale-[0.99]"
                      >
                        Continue
                      </button>
                      <p className="mt-3 text-[11px] text-zinc-500 dark:text-white/45">
                        By continuing, you agree to provide accurate information.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.4, ease }}
                    className="space-y-5"
                  >
                    {/* ✅ Driver type (beautiful segmented control) */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest ml-1 text-zinc-500 dark:text-zinc-400">
                        Driver type
                      </label>

                      <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl p-1.5">
                        <div className="grid grid-cols-2 gap-1">
                          {/* Company */}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((p) => ({
                                ...p,
                                driver_type: "company",
                                expected_gross: "",
                                expected_rpm: "",
                                expected_cpm: p.expected_cpm,
                                expected_miles: p.expected_miles,
                              }))
                            }}
                            className={[
                              "relative overflow-hidden rounded-xl px-4 py-3 text-left transition-all",
                              formData.driver_type === "company"
                                ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg"
                                : "bg-transparent text-zinc-700 dark:text-white/70 hover:bg-zinc-100/70 dark:hover:bg-white/10",
                            ].join(" ")}
                            aria-pressed={formData.driver_type === "company"}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-[11px] font-extrabold uppercase tracking-widest">Company</div>
                                <div className="text-[11px] mt-1 opacity-80">CPM + miles goals</div>
                              </div>

                              <div
                                className={[
                                  "h-9 w-9 rounded-xl flex items-center justify-center border",
                                  formData.driver_type === "company"
                                    ? "border-white/20 dark:border-black/10 bg-white/10 dark:bg-black/5"
                                    : "border-zinc-200/70 dark:border-white/10 bg-white/50 dark:bg-white/5",
                                ].join(" ")}
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="opacity-90"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M10 6h4" />
                                  <path d="M10 6a2 2 0 0 1 2-2 2 2 0 0 1 2 2" />
                                  <path d="M4 9h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Z" />
                                  <path d="M4 13h16" />
                                </svg>
                              </div>
                            </div>

                            {formData.driver_type === "company" && (
                              <span className="absolute inset-x-0 bottom-0 h-[2px] bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]" />
                            )}
                          </button>

                          {/* Owner Operator */}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData((p) => ({
                                ...p,
                                driver_type: "owner_operator",
                                expected_cpm: "",
                                expected_miles: "",
                                expected_gross: p.expected_gross,
                                expected_rpm: p.expected_rpm,
                              }))
                            }}
                            className={[
                              "relative overflow-hidden rounded-xl px-4 py-3 text-left transition-all",
                              formData.driver_type === "owner_operator"
                                ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg"
                                : "bg-transparent text-zinc-700 dark:text-white/70 hover:bg-zinc-100/70 dark:hover:bg-white/10",
                            ].join(" ")}
                            aria-pressed={formData.driver_type === "owner_operator"}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="text-[11px] font-extrabold uppercase tracking-widest">Owner</div>
                                <div className="text-[11px] mt-1 opacity-80">Gross + RPM floor</div>
                              </div>

                              <div
                                className={[
                                  "h-9 w-9 rounded-xl flex items-center justify-center border",
                                  formData.driver_type === "owner_operator"
                                    ? "border-white/20 dark:border-black/10 bg-white/10 dark:bg-black/5"
                                    : "border-zinc-200/70 dark:border-white/10 bg-white/50 dark:bg-white/5",
                                ].join(" ")}
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  className="opacity-90"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="9" />
                                  <path d="M7 12h10" />
                                  <path d="M12 12l2.5 6.5" />
                                  <path d="M12 12l-2.5 6.5" />
                                  <path d="M12 12V8" />
                                </svg>
                              </div>
                            </div>

                            {formData.driver_type === "owner_operator" && (
                              <span className="absolute inset-x-0 bottom-0 h-[2px] bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.35)]" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-zinc-500 dark:text-white/45 ml-1">
                        This only affects what expectations you enter — your contact stays private until you approve.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Living city"
                        name="city"
                        placeholder="Dallas"
                        value={formData.city}
                        onChange={handleChange}
                        isError={step2Attempted && !formData.city}
                      />
                      <Input
                        label="Living state"
                        name="state"
                        placeholder="TX"
                        maxLength={2}
                        value={formData.state}
                        onChange={handleChange}
                        isError={step2Attempted && !formData.state}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="CDL issue city"
                        name="cdl_city"
                        placeholder="City on CDL"
                        value={formData.cdl_city}
                        onChange={handleChange}
                        isError={step2Attempted && !formData.cdl_city}
                      />
                      <Input
                        label="CDL issue state"
                        name="cdl_state"
                        placeholder="State on CDL"
                        maxLength={2}
                        value={formData.cdl_state}
                        onChange={handleChange}
                        isError={step2Attempted && !formData.cdl_state}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Phone"
                        name="phone"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        isError={step2Attempted && formData.phone.length < 17}
                      />
                      <div>
                        <Input
                          label="CDL number"
                          name="cdl_number"
                          placeholder="6–12 letters/numbers"
                          value={formData.cdl_number}
                          onChange={handleCdlChange}
                          maxLength={12}
                          isError={step2Attempted && !isValidCdlNumber(formData.cdl_number)}
                        />
                      
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        label="Age"
                        name="age"
                        type="number"
                        inputMode="numeric"
                        step="1"
                        placeholder="25"
                        value={formData.age}
                        onChange={handleChange}
                        isError={step2Attempted && !formData.age}
                      />
                      <Input
                        label="Experience (yrs)"
                        name="experience_years"
                        type="number"
                        inputMode="numeric"
                        step="1"
                        placeholder="5"
                        value={formData.experience_years}
                        onChange={handleChange}
                        isError={step2Attempted && formData.experience_years === ""}
                      />
                      <Input
                        label="Endorsements"
                        name="endorsements"
                        placeholder="Hazmat, Tanker..."
                        value={formData.endorsements}
                        onChange={handleChange}
                      />
                    </div>

                    {/* ✅ NEW: Expectations block */}
                    <div
                      className={[
                        "rounded-3xl p-5 border backdrop-blur-xl",
                        "bg-white/70 dark:bg-white/5",
                        "border-zinc-200/70 dark:border-white/10",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300/80">
                            Expectations
                          </div>
                          <div className="text-sm font-extrabold text-zinc-800 dark:text-white/85">
                            Pay & workload targets
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-white/45 mt-1">{salaryHint}</p>
                        </div>
                        <div className="text-[11px] font-semibold text-zinc-500 dark:text-white/50 text-right">
                          Required • helps matching
                        </div>
                      </div>

                      <div className="mt-3">
                        {isOwner ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                              label="Expected gross / week (USD)"
                              name="expected_gross"
                              type="number"
                              inputMode="numeric"
                              step="100"
                              placeholder="5000"
                              value={formData.expected_gross}
                              onChange={handleChange}
                              isError={step2Attempted && !isNonNegativeNumber(formData.expected_gross)}
                            />
                            <Input
                              label="Minimum RPM ($/mile)"
                              name="expected_rpm"
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              placeholder="2"
                              value={formData.expected_rpm}
                              onChange={handleChange}
                              isError={step2Attempted && !isNonNegativeNumber(formData.expected_rpm)}
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                              label="Expected CPM (cents/mile)"
                              name="expected_cpm"
                              type="number"
                              inputMode="numeric"
                              step="1"
                              placeholder="65"
                              value={formData.expected_cpm}
                              onChange={handleChange}
                              isError={step2Attempted && !isNonNegativeNumber(formData.expected_cpm)}
                            />
                            <Input
                              label="Desired miles / week"
                              name="expected_miles"
                              type="number"
                              inputMode="numeric"
                              step="50"
                              placeholder="2500"
                              value={formData.expected_miles}
                              onChange={handleChange}
                              isError={step2Attempted && !isNonNegativeNumber(formData.expected_miles)}
                            />
                          </div>
                        )}

                        {step2Attempted && !salaryValid && (
                          <div className="mt-4 rounded-xl px-4 py-3 text-[11px] font-semibold text-center border bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20">
                            Please fill in the expectations fields to continue.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* optional file */}
                    <div className="relative group/upload">
                      <label className="block text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2 ml-1">
                        CDL photo (optional)
                      </label>

                      <div className="relative">
                        <input
                          type="file"
                          name="cdl_file"
                          onChange={handleChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div
                          className="w-full rounded-2xl p-4 flex items-center justify-center gap-2
                                        bg-zinc-50 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10
                                        text-zinc-600 dark:text-white/60 text-[11px] font-bold
                                        hover:bg-zinc-100/70 dark:hover:bg-white/10 transition-all"
                        >
                          <UploadIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="truncate">{formData.cdl_file ? formData.cdl_file.name : "Select a file"}</span>
                        </div>
                      </div>
                    </div>

                    {/* confidentiality */}
                    <label
                      className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${
                        formData.isConfidential
                          ? "bg-emerald-500/10 border-emerald-500/25"
                          : step2Attempted
                          ? "bg-red-500/10 border-red-500/25"
                          : "bg-zinc-50 dark:bg-white/5 border-zinc-200/70 dark:border-white/10"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="isConfidential"
                        checked={formData.isConfidential}
                        onChange={handleChange}
                        className="mt-1 h-4 w-4 rounded border-zinc-300 dark:border-white/10 bg-white dark:bg-zinc-900 text-emerald-500"
                      />
                      <span className="text-[11px] text-zinc-600 dark:text-white/60 font-semibold leading-relaxed">
                        I understand my documents are confidential and only visible to verified recruiters.
                      </span>
                    </label>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="rounded-xl px-4 py-3 text-[11px] font-semibold text-center border bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20"
                        >
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-6 py-4 rounded-2xl font-black uppercase tracking-[0.18em] text-[10px]
                                   bg-zinc-100/80 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10
                                   text-zinc-700 dark:text-white/70 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all"
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-4 rounded-2xl bg-emerald-500 text-black
                                   font-black uppercase tracking-[0.18em] text-xs hover:bg-emerald-400 transition-all
                                   shadow-lg shadow-emerald-500/15 active:scale-[0.99] disabled:opacity-60"
                      >
                        {loading ? "Creating profile..." : "Complete registration"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>

          <p className="text-center mt-7 text-xs text-zinc-600 dark:text-white/45 font-semibold">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-700 dark:text-emerald-300 font-black hover:underline">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  )
}

function Input({
  label,
  isError,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; isError?: boolean }) {
  return (
    <div className="space-y-2">
      <label
        className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${
          isError ? "text-red-600 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        {label}
      </label>

      <input
        {...props}
        className={[
          "w-full rounded-2xl px-4 py-3.5 text-sm font-semibold outline-none transition-all",
          "bg-zinc-50 dark:bg-white/5",
          "text-zinc-900 dark:text-white",
          "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
          "border",
          isError
            ? "border-red-500/40 focus:ring-2 focus:ring-red-500/20"
            : "border-zinc-200/70 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500/30",
          className ?? "",
        ].join(" ")}
      />
    </div>
  )
}

/* --- ICONS --- */
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
)

const UploadIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)
