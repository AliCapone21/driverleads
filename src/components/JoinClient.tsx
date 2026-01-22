"use client"

import React, { useState } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

/* --- Animation Settings --- */
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease } },
  exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.3, ease } },
}

export default function JoinClient() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    state: "",
    driver_type: "company", 
    experience_years: 0,
    endorsements: [] as string[],
    dob: "",
    status: "passive",
  })

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleEndorsement = (e: string) => {
    setFormData((prev) => {
      const exists = prev.endorsements.includes(e)
      return {
        ...prev,
        endorsements: exists ? prev.endorsements.filter((i) => i !== e) : [...prev.endorsements, e],
      }
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    // 1. Sign Up the User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (authError) {
      alert("Error creating account: " + authError.message)
      setLoading(false)
      return
    }

    if (!authData.user) {
      alert("Something went wrong. Please try again.")
      setLoading(false)
      return
    }
    
    // 2. Insert PUBLIC Profile (drivers table)
    const lastInitial = formData.last_name.charAt(0).toUpperCase()
    
    const { data: driverData, error: driverError } = await supabase
      .from("drivers")
      .insert({
        user_id: authData.user.id,
        first_name: formData.first_name,
        last_initial: lastInitial,
        city: formData.city,
        state: formData.state,
        living_city: formData.city, 
        living_state: formData.state,
        driver_type: formData.driver_type,
        experience_years: Number(formData.experience_years),
        endorsements: formData.endorsements,
        dob: formData.dob,
        status: formData.status 
      })
      .select()
      .single()

    if (driverError) {
      alert("Account created, but profile failed: " + driverError.message)
      setLoading(false)
      return
    }

    // 3. Insert PRIVATE Info (driver_private table)
    const { error: privateError } = await supabase
      .from("driver_private")
      .insert({
        driver_id: driverData.id, // Link to the public profile
        email: formData.email,
        phone: formData.phone,
      })

    if (privateError) {
      alert("Profile created, but contact info failed: " + privateError.message)
      setLoading(false)
    } else {
      router.push("/drivers/dashboard")
    }
  }

  const nextStep = () => setStep((s) => s + 1)
  const prevStep = () => setStep((s) => s - 1)

  return (
    <main className="min-h-screen bg-[#070A12] text-white flex flex-col relative overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="p-6 flex justify-between items-center relative z-10">
        <a href="/" className="font-extrabold text-xl tracking-tight flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center text-sm">DL</div>
          Driver Leads
        </a>
        <div className="text-sm font-medium text-white/50">
          Step <span className="text-white">{step}</span> of 4
        </div>
      </header>

      {/* Wizard Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 relative z-10 pb-20">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <motion.div key="step1" variants={fadeUp} initial="hidden" animate="show" exit="exit" className="w-full max-w-md">
              <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Create Account</h1>
              <p className="text-white/50 mb-8">Start by creating your secure login.</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase mb-1 block">First Name</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500/50 outline-none transition-all"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={e => updateField("first_name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Last Name</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500/50 outline-none transition-all"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={e => updateField("last_name", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Email</label>
                  <input 
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500/50 outline-none transition-all"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={e => updateField("email", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Password</label>
                  <input 
                    type="password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500/50 outline-none transition-all"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={e => updateField("password", e.target.value)}
                  />
                </div>

                <div className="pt-4">
                    <button 
                     onClick={nextStep}
                    disabled={!formData.first_name || !formData.last_name || !formData.email || formData.password.length < 6}
                    className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                   >
                     Next Step
                   </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: EXPERIENCE */}
          {step === 2 && (
            <motion.div key="step2" variants={fadeUp} initial="hidden" animate="show" exit="exit" className="w-full max-w-md">
              <h1 className="text-3xl font-extrabold mb-2">Your Experience</h1>
              <p className="text-white/50 mb-8">Recruiters filter by these details. Be accurate.</p>

              <div className="space-y-5">
                <div>
                   <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Driver Type</label>
                   <div className="grid grid-cols-2 gap-3">
                     <button 
                       onClick={() => updateField("driver_type", "company")}
                       className={`p-3 rounded-xl border font-bold text-sm transition-all ${formData.driver_type === "company" ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-white/5 border-white/10 text-white/60"}`}
                     >
                       Company Driver
                     </button>
                     <button 
                       onClick={() => updateField("driver_type", "owner_operator")}
                       className={`p-3 rounded-xl border font-bold text-sm transition-all ${formData.driver_type === "owner_operator" ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-white/5 border-white/10 text-white/60"}`}
                     >
                       Owner Operator
                     </button>
                   </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Years of Experience</label>
                  <input 
                    type="number"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500/50 outline-none transition-all"
                    placeholder="e.g. 5"
                    value={formData.experience_years}
                    onChange={e => updateField("experience_years", e.target.value)}
                  />
                </div>

                <div>
                   <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Endorsements</label>
                   <div className="flex flex-wrap gap-2">
                     {["Hazmat", "Tanker", "Doubles/Triples", "Flatbed", "Reefer", "Dry Van"].map(e => (
                       <button
                        key={e}
                        onClick={() => toggleEndorsement(e)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${formData.endorsements.includes(e) ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/60"}`}
                       >
                         {e}
                       </button>
                     ))}
                   </div>
                </div>

                <div className="flex gap-3 pt-4">
                   <button onClick={prevStep} className="px-6 py-4 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10">Back</button>
                   <button onClick={nextStep} className="flex-1 py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-white/90">Next Step</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: LOCATION & CONTACT */}
          {step === 3 && (
            <motion.div key="step3" variants={fadeUp} initial="hidden" animate="show" exit="exit" className="w-full max-w-md">
              <h1 className="text-3xl font-extrabold mb-2">Details</h1>
              <p className="text-white/50 mb-8">Where are you based?</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase mb-1 block">City</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500/50 outline-none transition-all"
                      placeholder="Chicago"
                      value={formData.city}
                      onChange={e => updateField("city", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/40 uppercase mb-1 block">State (Abbr)</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500/50 outline-none transition-all"
                      placeholder="IL"
                      maxLength={2}
                      value={formData.state}
                      onChange={e => updateField("state", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Phone Number</label>
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500/50 outline-none transition-all"
                    placeholder="(555) 000-0000"
                    type="tel"
                    value={formData.phone}
                    onChange={e => updateField("phone", e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-white/40 uppercase mb-1 block">Date of Birth</label>
                  <input 
                    type="date"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-emerald-500/50 outline-none transition-all text-white/80"
                    value={formData.dob}
                    onChange={e => updateField("dob", e.target.value)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                   <button onClick={prevStep} className="px-6 py-4 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10">Back</button>
                   <button 
                    onClick={nextStep}
                    disabled={!formData.phone || !formData.dob}
                    className="flex-1 py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     Next Step
                   </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: STATUS & SUBMIT */}
          {step === 4 && (
            <motion.div key="step4" variants={fadeUp} initial="hidden" animate="show" exit="exit" className="w-full max-w-md">
              <h1 className="text-3xl font-extrabold mb-2">Final Step</h1>
              <p className="text-white/50 mb-8">What is your current status?</p>

              <div className="space-y-4">
                
                {/* Status Selection */}
                <button
                  onClick={() => updateField("status", "active")}
                  className={`w-full p-5 rounded-2xl border text-left transition-all group ${formData.status === "active" ? "bg-emerald-500/10 border-emerald-500" : "bg-white/5 border-white/10 hover:border-white/20"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-lg ${formData.status === "active" ? "text-emerald-400" : "text-white"}`}>Urgently Looking</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.status === "active" ? "border-emerald-400" : "border-white/20"}`}>
                      {formData.status === "active" && <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full" />}
                    </div>
                  </div>
                  <p className="text-sm text-white/50">I need a job ASAP. Show my profile to everyone.</p>
                </button>

                <button
                  onClick={() => updateField("status", "passive")}
                  className={`w-full p-5 rounded-2xl border text-left transition-all group ${formData.status === "passive" ? "bg-indigo-500/10 border-indigo-500" : "bg-white/5 border-white/10 hover:border-white/20"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-lg ${formData.status === "passive" ? "text-indigo-400" : "text-white"}`}>Open to Offers</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.status === "passive" ? "border-indigo-400" : "border-white/20"}`}>
                      {formData.status === "passive" && <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full" />}
                    </div>
                  </div>
                  <p className="text-sm text-white/50">I have a job, but I'll switch for better pay.</p>
                </button>

                <div className="pt-6">
                   <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
                   >
                     {loading ? "Creating Account..." : "Join Driver Leads"}
                   </button>
                   <p className="text-center text-[10px] text-white/30 mt-4 uppercase font-bold tracking-widest">No hidden fees • 100% Free for drivers</p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  )
}