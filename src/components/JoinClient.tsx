// src/components/JoinClient.tsx

"use client"

import React, { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"

const ease = [0.22, 1, 0.36, 1] as const

export default function JoinClient() {
    const router = useRouter()
    const supabase = createClient()

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
        driver_type: "company",
        isConfidential: false,
        cdl_file: null as File | null,
    })

    /* --- Validation --- */
    const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email)
    
    const isStep1Valid = 
        formData.first_name && 
        formData.last_name && 
        isValidEmail(formData.email) && 
        formData.password.length >= 8 && 
        formData.password === formData.confirmPassword

    const isStep2Valid = 
        formData.city && 
        formData.state && 
        formData.cdl_city &&
        formData.cdl_state &&
        formData.phone.length >= 17 && 
        formData.experience_years !== "" &&
        formData.age !== "" &&
        formData.cdl_number && 
        formData.isConfidential

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
            const d = digits.startsWith('1') ? digits.slice(1) : digits
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

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault()
        setStep2Attempted(true)
        if (!isStep2Valid) return

        setLoading(true)
        setError(null)

        try {
            // 1. Auth SignUp
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            })
            if (authError) throw authError
            if (!authData.user) throw new Error("Registration failed.")

            // 2. Prepare Data
            const endsArray = formData.endorsements.split(',').map(s => s.trim()).filter(s => s !== "")
            
            // Calculate a DOB from age for the DB
            const calculatedDob = new Date(new Date().getFullYear() - Number(formData.age), 0, 1).toISOString().split('T')[0]

            // 3. Insert PUBLIC Profile
            const { data: driver, error: drvErr } = await supabase
                .from("drivers")
                .insert({
                    user_id: authData.user.id,
                    first_name: formData.first_name,
                    last_initial: formData.last_name, 
                    city: formData.cdl_city,
                    state: formData.cdl_state,
                    living_city: formData.city,
                    living_state: formData.state,
                    experience_years: Number(formData.experience_years),
                    endorsements: endsArray,
                    driver_type: formData.driver_type,
                    status: 'active',
                    dob: calculatedDob
                })
                .select().single()

            if (drvErr) throw drvErr

            // 4. Insert PRIVATE Info
            const { error: privErr } = await supabase
                .from("driver_private")
                .insert({
                    driver_id: driver.id,
                    email: formData.email,
                    phone: formData.phone,
                    cdl_number: formData.cdl_number
                })
            
            if (privErr) throw privErr

            // 5. Upload File (Optional)
            if (formData.cdl_file) {
                const fileExt = formData.cdl_file.name.split('.').pop()
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

    return (
        <div className="min-h-screen bg-[#070A12] text-white font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="w-full max-w-xl relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex h-12 w-12 rounded-2xl bg-white text-black items-center justify-center font-black text-xl mb-4 shadow-2xl">DL</div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Join the Fleet</h1>
                    <p className="text-zinc-500 font-medium tracking-tight">Phase {step} of 2</p>
                </div>

                <div className="flex gap-2 mb-8 px-8">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: step >= i ? "100%" : "0%" }} className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                        </div>
                    ))}
                </div>

                <form onSubmit={handleJoin} className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.4, ease }} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="First Name" name="first_name" placeholder="John" value={formData.first_name} onChange={handleChange} isError={step1Attempted && !formData.first_name} />
                                    <Input label="Surname" name="last_name" placeholder="Doe" value={formData.last_name} onChange={handleChange} isError={step1Attempted && !formData.last_name} />
                                </div>
                                <Input label="Email Address" name="email" type="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} isError={step1Attempted && !isValidEmail(formData.email)} />
                                
                                <div className="relative">
                                    <Input label="Create Password" name="password" type={showPassword ? "text" : "password"} placeholder="Min 8 characters" value={formData.password} onChange={handleChange} isError={step1Attempted && formData.password.length < 8} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 bottom-4 text-zinc-500 hover:text-white transition-colors">{showPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                                </div>

                                <div className="relative">
                                    <Input label="Confirm Password" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} isError={step1Attempted && formData.password !== formData.confirmPassword} />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 bottom-4 text-zinc-500 hover:text-white transition-colors">{showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}</button>
                                </div>
                                
                                <button type="button" onClick={handleNextStep} className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all mt-4 active:scale-95">
                                    Next: Professional Details
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease }} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Living City" name="city" placeholder="e.g. Dallas" value={formData.city} onChange={handleChange} isError={step2Attempted && !formData.city} />
                                    <Input label="Living State" name="state" placeholder="TX" maxLength={2} value={formData.state} onChange={handleChange} isError={step2Attempted && !formData.state} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="CDL Issue City" name="cdl_city" placeholder="City on CDL" value={formData.cdl_city} onChange={handleChange} isError={step2Attempted && !formData.cdl_city} />
                                    <Input label="CDL Issue State" name="cdl_state" placeholder="State on CDL" maxLength={2} value={formData.cdl_state} onChange={handleChange} isError={step2Attempted && !formData.cdl_state} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Phone Number" name="phone" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handlePhoneChange} isError={step2Attempted && formData.phone.length < 17} />
                                    <Input label="CDL Number" name="cdl_number" placeholder="Enter number" value={formData.cdl_number} onChange={handleChange} isError={step2Attempted && !formData.cdl_number} />
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4">
                                    <Input label="Age" name="age" type="number" placeholder="25" value={formData.age} onChange={handleChange} isError={step2Attempted && !formData.age} />
                                    <Input label="Exp (Yrs)" name="experience_years" type="number" placeholder="5" value={formData.experience_years} onChange={handleChange} isError={step2Attempted && formData.experience_years === ""} />
                                    <Input label="Endorsements" name="endorsements" placeholder="Hazmat, Tanker..." value={formData.endorsements} onChange={handleChange} />
                                </div>

                                <div className="relative group/upload">
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">CDL photo (optional)</label>
                                    <div className="relative">
                                        <input type="file" name="cdl_file" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <div className="w-full bg-white/5 border border-white/5 text-zinc-400 text-[10px] rounded-xl p-4 font-black uppercase tracking-tighter text-center transition-all group-hover/upload:bg-white/10 flex items-center justify-center gap-2">
                                            <UploadIcon className="w-4 h-4 text-emerald-500" />
                                            <span className="truncate">{formData.cdl_file ? formData.cdl_file.name : "Select File"}</span>
                                        </div>
                                    </div>
                                </div>

                                <label className={`flex items-start gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${formData.isConfidential ? "bg-emerald-500/5 border-emerald-500/20" : step2Attempted ? "bg-red-500/5 border-red-500/30" : "bg-white/5 border-white/5"}`}>
                                    <input type="checkbox" name="isConfidential" checked={formData.isConfidential} onChange={handleChange} className="mt-1 h-4 w-4 rounded border-white/10 bg-zinc-900 text-emerald-500" />
                                    <span className="text-[10px] text-zinc-400 font-medium leading-relaxed uppercase tracking-tight">I understand my documents are strictly confidential and only visible to verified recruiters.</span>
                                </label>

                                {error && <p className="text-red-400 text-[10px] font-bold text-center uppercase italic">{error}</p>}

                                <div className="flex gap-3 mt-4">
                                    <button type="button" onClick={() => setStep(1)} className="px-6 py-4 bg-white/5 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">Back</button>
                                    <button type="submit" disabled={loading} className="flex-1 py-4 bg-emerald-500 text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 active:scale-95">
                                        {loading ? "Establishing Protocol..." : "Complete Registration"}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
                <p className="text-center mt-8 text-zinc-600 text-xs font-medium">Already have an account? <Link href="/login" className="text-zinc-400 font-bold hover:text-white underline underline-offset-4">Sign In</Link></p>
            </motion.div>
        </div>
    )
}

function Input({ label, isError, ...props }: any) {
    return (
        <div className="space-y-2">
            <label className={`block text-[10px] font-black uppercase tracking-widest ml-1 ${isError ? 'text-red-500' : 'text-zinc-500'}`}>{label}</label>
            <input {...props} className={`w-full bg-white/5 border ${isError ? 'border-red-500/40 shadow-[0_0_10px_rgba(239,44,44,0.1)]' : 'border-white/5'} text-white text-sm rounded-xl p-4 placeholder:text-zinc-800 focus:bg-white/10 outline-none transition-all font-bold`} />
        </div>
    )
}

/* --- ICONS --- */
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
const UploadIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
