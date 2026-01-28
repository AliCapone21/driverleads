"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"

/* --- Types --- */
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

interface InputProps {
  label: string
  placeholder: string
  value: string | number
  onChange: (val: string) => void
  type?: string
  maxLength?: number
}

interface DropdownProps {
  value: string
  options: { label: string; value: string }[]
  onChange: (val: string) => void
}

export default function AdminDashboard() {
  const supabase = createClient()

  const [drivers, setDrivers] = useState<DriverRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [form, setForm] = useState({
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
    cdl_file: null as File | null,
  })

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, "")
    let formatted = digits
    if (digits.length > 0) {
        const d = digits.startsWith('1') ? digits.slice(1) : digits
        const limited = d.slice(0, 10)
        if (limited.length === 0) formatted = ""
        else if (limited.length <= 3) formatted = `+1 (${limited}`
        else if (limited.length <= 6) formatted = `+1 (${limited.slice(0, 3)}) ${limited.slice(3)}`
        else formatted = `+1 (${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`
    }
    setForm({ ...form, phone: formatted })
  }

  const loadDrivers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("drivers")
      .select("id, first_name, last_initial, city, state, experience_years, endorsements, created_at")
      .order("created_at", { ascending: false })

    if (error) setMsg({ type: 'error', text: error.message })
    else setDrivers(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadDrivers()
  }, [loadDrivers])

  async function createDriver() {
    setMsg(null)
    setSubmitting(true)
    
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) {
      window.location.href = "/login"
      return
    }

    const endorsements = form.endorsements.split(",").map((s) => s.trim()).filter(Boolean)
    const lastInitial = form.last_name.trim().charAt(0).toUpperCase()

    let dbDate = null
    if (form.dob && form.dob.length === 10) {
        const [day, month, year] = form.dob.split('/')
        dbDate = `${year}-${month}-${day}`
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
        endorsements: endorsements,
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
      setMsg({ type: 'error', text: json?.error ?? "Failed to create driver" })
      return
    }

    if (form.cdl_file) {
        const fd = new FormData()
        fd.append("accessToken", token)
        fd.append("driverId", json.id)
        fd.append("file", form.cdl_file)

        try {
            const upRes = await fetch("/api/admin/cdl-upload", { method: "POST", body: fd })
            const upJson = await upRes.json()
            if (!upRes.ok) setMsg({ type: 'error', text: `Saved, but CDL upload failed: ${upJson?.error}` })
            else setMsg({ type: 'success', text: "Driver created + CDL uploaded" })
        } catch {
             setMsg({ type: 'error', text: "Saved, but CDL upload network error." })
        }
    } else {
        setMsg({ type: 'success', text: "Driver created successfully" })
    }

    setSubmitting(false)
    setForm({
      first_name: "", last_name: "", city: "", state: "", experience_years: "", endorsements: "",
      driver_type: "company", dob: "", living_city: "", living_state: "", phone: "", email: "",
      cdl_number: "", cdl_file: null,
    })
    
    const fileInput = document.getElementById('cdl_file_input') as HTMLInputElement;
    if(fileInput) fileInput.value = "";
    await loadDrivers()
  }

  async function deleteDriver(driverId: string) {
    if(!confirm("Are you sure?")) return;
    setMsg(null)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return

    const res = await fetch("/api/admin/driver", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: session.access_token, driverId }),
    })

    if (res.ok) {
      setMsg({ type: 'success', text: "Driver deleted" })
      await loadDrivers()
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 bg-[#070A12] text-zinc-100 min-h-screen">
        {msg && (
             <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 shadow-2xl animate-in slide-in-from-top-2 ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${msg.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="font-medium text-sm">{msg.text}</span>
            </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-4 lg:sticky lg:top-24">
                <div className="bg-zinc-900 rounded-3xl shadow-2xl border border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <h2 className="font-bold text-white text-lg">Add New Driver</h2>
                        <p className="text-xs text-zinc-500 mt-1 font-medium tracking-tight">Enter secure driver credentials.</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Public Profile</h3>
                            
                            <SelectDropdown 
                                value={form.driver_type}
                                options={[{ label: "Company Driver", value: "company" }, { label: "Owner Operator (O/O)", value: "owner_operator" }]}
                                onChange={(v: string) => setForm({ ...form, driver_type: v as any })}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <Input label="First Name" placeholder="John" value={form.first_name} onChange={(v: string) => setForm({...form, first_name: v})} />
                                <Input label="Last Name" placeholder="Doe" value={form.last_name} onChange={(v: string) => setForm({...form, last_name: v})} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Input label="City (Work)" placeholder="Dallas" value={form.city} onChange={(v: string) => setForm({...form, city: v})} />
                                <Input label="State (Work)" placeholder="TX" value={form.state} onChange={(v: string) => setForm({...form, state: v.toUpperCase()})} maxLength={2} />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-1">
                                    <Input label="Exp (Yrs)" placeholder="5" type="number" value={form.experience_years} onChange={(v: string) => setForm({...form, experience_years: v})} />
                                </div>
                                <div className="col-span-2">
                                    <Input label="Endorsements" placeholder="Hazmat, Tanker" value={form.endorsements} onChange={(v: string) => setForm({...form, endorsements: v})} />
                                </div>
                            </div>
                        </div>

                        <hr className="border-white/5" />

                        <div className="space-y-4">
                             <div className="flex items-center gap-2">
                                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Locked Data</h3>
                                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold border border-amber-500/20">PRIVATE</span>
                             </div>
                             
                             <CustomDatePicker label="Date of Birth" value={form.dob} onChange={(v: string) => setForm({...form, dob: v})} />

                             <div className="grid grid-cols-2 gap-3">
                                <Input label="Living City" placeholder="Austin" value={form.living_city} onChange={(v: string) => setForm({...form, living_city: v})} />
                                <Input label="Living State" placeholder="TX" value={form.living_state} onChange={(v: string) => setForm({...form, living_state: v.toUpperCase()})} maxLength={2} />
                             </div>

                             <Input label="Phone Number" placeholder="+1 (555) 000-0000" value={form.phone} onChange={handlePhoneChange} />
                             <Input label="Email Address" placeholder="driver@email.com" value={form.email} onChange={(v: string) => setForm({...form, email: v})} />
                             <Input label="CDL Number" placeholder="A1234567" value={form.cdl_number} onChange={(v: string) => setForm({...form, cdl_number: v})} />
                             
                             <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Upload CDL</label>
                                <input
                                    id="cdl_file_input"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer bg-white/5 rounded-xl border border-white/5 focus:border-white/10 transition-all outline-none"
                                    onChange={(e) => setForm({ ...form, cdl_file: e.target.files?.[0] ?? null })}
                                />
                             </div>
                        </div>

                        <button
                            onClick={createDriver}
                            disabled={submitting}
                            className="w-full py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-zinc-200 transition-all disabled:opacity-50 active:scale-95"
                        >
                            {submitting ? "Writing to DB..." : "Create Driver Record"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-8">
                <div className="bg-zinc-900 rounded-3xl shadow-2xl border border-white/5 flex flex-col min-h-[600px] overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <div className="flex items-center gap-3">
                             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <h2 className="font-bold text-white uppercase text-xs tracking-widest">System Records ({drivers.length})</h2>
                        </div>
                        <button onClick={loadDrivers} className="text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest">
                            Sync Refresh
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto">
                        {loading ? (
                            <div className="p-20 text-center">
                                <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Querying database...</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Identity</th>
                                        <th className="px-6 py-4 text-left">Location</th>
                                        <th className="px-6 py-4 text-left">Stats</th>
                                        <th className="px-6 py-4 text-right">Ops</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {drivers.map((d) => (
                                        <tr key={d.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white text-base">{d.first_name} {d.last_initial}.</div>
                                                <div className="text-[9px] text-zinc-500 font-mono mt-1 tracking-tighter">UUID: {d.id.slice(0, 8)}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-zinc-300 font-bold">{d.city}, {d.state}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-emerald-500/10 rounded text-[10px] font-black text-emerald-400 border border-emerald-500/20">{d.experience_years}Y EXP</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <a href={`/drivers/${d.id}`} target="_blank" className="p-2 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white transition-all">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </a>
                                                    <button onClick={() => deleteDriver(d.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

/* --- Reusable Components --- */

function Input({ label, placeholder, value, onChange, type = "text", maxLength }: InputProps) {
    return (
        <div>
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
            <input
                type={type}
                maxLength={maxLength}
                className="w-full bg-white/5 border border-white/5 text-white text-sm rounded-xl focus:bg-white/10 focus:border-white/10 p-3 transition-all outline-none placeholder-zinc-700 font-bold"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}

function SelectDropdown({ value, options, onChange }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        function outside(e: any) { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false) }
        document.addEventListener("mousedown", outside); return () => document.removeEventListener("mousedown", outside)
    }, [])

    const label = options.find((o) => o.value === value)?.label || "Select..."

    return (
        <div className="relative" ref={ref}>
            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Driver Type</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white/5 border border-white/5 text-white text-sm rounded-xl p-3 outline-none font-bold hover:bg-white/10 transition-colors"
            >
                {label}
                <svg className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-full bg-zinc-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {options.map((opt) => (
                        <button key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false) }} className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors ${value === opt.value ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

function CustomDatePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    // Boss, I added the Click Outside handler here for you:
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '').slice(0, 8)
        if (val.length > 4) val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`
        else if (val.length > 2) val = `${val.slice(0, 2)}/${val.slice(2)}`
        onChange(val); 
        if (val.length === 10) setViewDate(pDate(val))
    }
    const pDate = (v: string) => {
        if (!v || v.length !== 10) return new Date();
        const [d, m, y] = v.split('/');
        return new Date(Number(y), Number(m) - 1, Number(d));
    }
    const [viewDate, setViewDate] = useState(pDate(value))
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
    const currentYear = viewDate.getFullYear()
    const currentMonth = viewDate.getMonth()
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const firstDay = new Date(currentYear, currentMonth, 1).getDay()

    return (
        <div className="relative" ref={ref}>
             <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
             <div className="relative">
                <input
                    type="text"
                    className="w-full bg-white/5 border border-white/5 text-white text-sm rounded-xl p-3 transition-all outline-none font-bold"
                    placeholder="DD/MM/YYYY"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                />
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
             </div>
             {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-[280px] bg-zinc-800 border border-white/10 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => setViewDate(new Date(viewDate.setMonth(currentMonth - 1)))} className="p-1 hover:bg-white/10 rounded-lg text-zinc-400">←</button>
                        <div className="text-xs font-black uppercase text-white tracking-widest">{months[currentMonth]} {currentYear}</div>
                        <button onClick={() => setViewDate(new Date(viewDate.setMonth(currentMonth + 1)))} className="p-1 hover:bg-white/10 rounded-lg text-zinc-400">→</button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {days.map(d => <div key={d} className="text-[9px] font-black text-zinc-600">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={i} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNum = i + 1;
                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        const dd = String(dayNum).padStart(2, '0');
                                        const mm = String(currentMonth + 1).padStart(2, '0');
                                        onChange(`${dd}/${mm}/${currentYear}`); 
                                        setIsOpen(false);
                                    }}
                                    className="h-8 w-8 text-[10px] font-black rounded-lg hover:bg-white/10 text-white"
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