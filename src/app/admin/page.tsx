"use client"

// ⚠️ THIS FIXES THE BUILD ERROR
// It tells Next.js: "Don't try to build this page statically. It's a dynamic admin dashboard."
export const dynamic = "force-dynamic"

import { useEffect, useState, useRef, Suspense } from "react"
import { supabase } from "@/lib/supabaseClient"

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

/* --- Internal Component for Logic --- */
function AdminDashboardContent() {
  const [drivers, setDrivers] = useState<DriverRow[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Form State
  const [form, setForm] = useState({
    first_name: "",
    last_initial: "",
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

  // --- Helpers ---
  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, "")
    let formatted = digits
    if (digits.length > 0) {
        const d = digits.startsWith('1') ? digits.slice(1) : digits
        const limited = d.slice(0, 10)
        
        if (limited.length === 0) {
            formatted = ""
        } else if (limited.length <= 3) {
            formatted = `+1 (${limited}`
        } else if (limited.length <= 6) {
            formatted = `+1 (${limited.slice(0, 3)}) ${limited.slice(3)}`
        } else {
            formatted = `+1 (${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`
        }
    }
    setForm({ ...form, phone: formatted })
  }

  // --- API Actions ---
  async function getToken() {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }

  async function loadDrivers() {
    setLoading(true)
    const { data, error } = await supabase
      .from("drivers")
      .select("id, first_name, last_initial, city, state, experience_years, endorsements, created_at")
      .order("created_at", { ascending: false })

    if (error) setMsg({ type: 'error', text: error.message })
    setDrivers(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadDrivers()
  }, [])

  async function createDriver() {
    setMsg(null)
    setSubmitting(true)
    
    const token = await getToken()
    if (!token) {
      window.location.href = "/login"
      return
    }

    const endorsements = form.endorsements.split(",").map((s) => s.trim()).filter(Boolean)

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
        last_initial: form.last_initial,
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
            if (!upRes.ok) {
                setMsg({ type: 'error', text: `Saved, but CDL upload failed: ${upJson?.error}` })
            } else {
                setMsg({ type: 'success', text: "Driver created + CDL uploaded" })
            }
        } catch (err) {
             setMsg({ type: 'error', text: "Saved, but CDL upload network error." })
        }
    } else {
        setMsg({ type: 'success', text: "Driver created successfully" })
    }

    setSubmitting(false)
    setForm({
      first_name: "", last_initial: "", city: "", state: "", experience_years: "", endorsements: "",
      driver_type: "company", dob: "", living_city: "", living_state: "", phone: "", email: "",
      cdl_number: "", cdl_file: null,
    })
    
    const fileInput = document.getElementById('cdl_file_input') as HTMLInputElement;
    if(fileInput) fileInput.value = "";

    await loadDrivers()
  }

  async function deleteDriver(driverId: string) {
    if(!confirm("Are you sure you want to delete this driver?")) return;
    setMsg(null)
    const token = await getToken()
    if (!token) return

    const res = await fetch("/api/admin/driver", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: token, driverId }),
    })

    if (!res.ok) {
      setMsg({ type: 'error', text: "Delete failed" })
      return
    }

    setMsg({ type: 'success', text: "Driver deleted" })
    await loadDrivers()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
        {msg && (
             <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 shadow-sm animate-in slide-in-from-top-2 ${msg.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${msg.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="font-medium text-sm">{msg.text}</span>
            </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-4 lg:sticky lg:top-24">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/30">
                        <h2 className="font-bold text-gray-900 text-lg">Add New Driver</h2>
                        <p className="text-xs text-gray-400 mt-1 font-medium">New entries appear immediately.</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Public Profile</h3>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Driver Type</label>
                                <SelectDropdown 
                                    value={form.driver_type}
                                    options={[{ label: "Company Driver", value: "company" }, { label: "Owner Operator (O/O)", value: "owner_operator" }]}
                                    onChange={(val) => setForm({ ...form, driver_type: val })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Input label="First Name" placeholder="John" value={form.first_name} onChange={v => setForm({...form, first_name: v})} />
                                <Input label="Last Initial" placeholder="D" value={form.last_initial} onChange={v => setForm({...form, last_initial: v})} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Input label="City (Work)" placeholder="Dallas" value={form.city} onChange={v => setForm({...form, city: v})} />
                                <Input label="State (Work)" placeholder="TX" value={form.state} onChange={v => setForm({...form, state: v})} />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-1">
                                    <Input label="Exp (Yrs)" placeholder="5" type="number" value={form.experience_years} onChange={v => setForm({...form, experience_years: v})} />
                                </div>
                                <div className="col-span-2">
                                    <Input label="Endorsements" placeholder="Hazmat, Tanker" value={form.endorsements} onChange={v => setForm({...form, endorsements: v})} />
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        <div className="space-y-4">
                             <div className="flex items-center gap-2">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Locked Data</h3>
                                <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold border border-amber-100">PRIVATE</span>
                             </div>
                             
                             <CustomDatePicker 
                                label="Date of Birth"
                                value={form.dob}
                                onChange={(v) => setForm({...form, dob: v})}
                             />

                             <div className="grid grid-cols-2 gap-3">
                                <Input label="Living City" placeholder="Austin" value={form.living_city} onChange={v => setForm({...form, living_city: v})} />
                                <Input label="Living State" placeholder="TX" value={form.living_state} onChange={v => setForm({...form, living_state: v})} />
                             </div>

                             <Input 
                                label="Phone Number" 
                                placeholder="+1 (555) 000-0000" 
                                value={form.phone} 
                                onChange={handlePhoneChange} 
                             />
                             
                             <Input label="Email Address" placeholder="driver@email.com" value={form.email} onChange={v => setForm({...form, email: v})} />
                             <Input label="CDL Number" placeholder="A1234567" value={form.cdl_number} onChange={v => setForm({...form, cdl_number: v})} />
                             
                             <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">Upload CDL</label>
                                <div className="relative group">
                                    <input
                                        id="cdl_file_input"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-600 hover:file:bg-gray-200 cursor-pointer bg-gray-50 rounded-xl border border-transparent focus:border-gray-200 focus:bg-white transition-all outline-none"
                                        onChange={(e) => setForm({ ...form, cdl_file: e.target.files?.[0] ?? null })}
                                    />
                                </div>
                             </div>
                        </div>

                        <button
                            onClick={createDriver}
                            disabled={submitting}
                            className="w-full py-3.5 px-4 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-gray-900/20 hover:bg-black hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {submitting ? "Saving Record..." : "Create Driver Record"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-8">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col min-h-[600px] overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <div className="flex items-center gap-3">
                             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                             <h2 className="font-bold text-gray-900">Database Records ({drivers.length})</h2>
                        </div>
                        <button onClick={loadDrivers} className="text-xs font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all">
                            Refresh List
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto">
                        {loading ? (
                            <div className="p-20 text-center">
                                <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-400 text-sm font-medium">Loading database...</p>
                            </div>
                        ) : drivers.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="inline-flex h-16 w-16 rounded-2xl bg-gray-50 items-center justify-center mb-6">
                                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                                </div>
                                <h3 className="text-gray-900 font-bold text-lg">No drivers found</h3>
                                <p className="text-gray-500 text-sm mt-2">Use the form on the left to add your first record.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/50 text-gray-400 text-xs uppercase tracking-wider font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Name / ID</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Stats</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {drivers.map((d) => (
                                        <tr key={d.id} className="group hover:bg-gray-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900 text-base">{d.first_name} {d.last_initial}.</div>
                                                <div className="text-[10px] text-gray-400 font-mono mt-1">ID: {d.id.slice(0, 8)}...</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-700 font-medium">{d.city}, {d.state}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">{d.experience_years}y</span>
                                                    <span className="text-xs text-gray-400">{(d.endorsements ?? []).length} Endrs</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <a href={`/drivers/${d.id}`} className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-400 hover:text-black hover:shadow-sm transition-all">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    </a>
                                                    <button onClick={() => deleteDriver(d.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
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

/* --- Default Export with Suspense --- */
export default function AdminPage() {
    return (
        <main className="min-h-screen bg-[#F8FAFC] text-gray-900 relative font-sans selection:bg-black selection:text-white pb-20">
            {/* Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] opacity-60" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[100px] opacity-60" />
            </div>

            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gray-950 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-gray-200">DL</div>
                        <h1 className="font-bold text-lg tracking-tight text-gray-900">Admin Console</h1>
                    </div>
                    <a href="/drivers" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-2 group">
                        Exit to App 
                        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                    </a>
                </div>
            </header>

            {/* Suspense Boundary */}
            <Suspense fallback={
                <div className="min-h-[500px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-medium text-gray-500">Loading Dashboard...</p>
                    </div>
                </div>
            }>
                <AdminDashboardContent />
            </Suspense>
        </main>
    )
}

/* --- Components --- */

function Input({ label, placeholder, value, onChange, type = "text" }: { label: string, placeholder: string, value: string | number, onChange: (val: string) => void, type?: string }) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">{label}</label>
            <input
                type={type}
                className="w-full bg-gray-50 border border-transparent text-gray-900 text-sm rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 block p-3 transition-all outline-none placeholder-gray-400 font-medium"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}

function SelectDropdown({ value, options, onChange }: { value: string, options: {label: string, value: string}[], onChange: (val: string) => void }) {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false)
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])

    const selectedLabel = options.find(o => o.value === value)?.label || "Select..."

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-gray-50 border border-transparent text-gray-900 text-sm rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 p-3 transition-all outline-none font-medium"
            >
                {selectedLabel}
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
                    {options.map((opt) => (
                        <button key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false) }} className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors ${value === opt.value ? 'bg-gray-50 text-black' : 'text-gray-600 hover:bg-gray-50 hover:text-black'}`}>
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

function CustomDatePicker({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    
    // Parse initial value (DD/MM/YYYY) for calendar view
    const parseDate = (val: string) => {
        if (!val || val.length !== 10) return new Date();
        const [d, m, y] = val.split('/');
        const parsed = new Date(Number(y), Number(m) - 1, Number(d));
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    }

    const [viewDate, setViewDate] = useState(parseDate(value));

    // Handle manual typing with auto-masking (DD/MM/YYYY)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
        
        if (val.length > 8) val = val.slice(0, 8); // Limit to 8 digits

        // Auto-insert slashes
        if (val.length > 4) {
            val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
        } else if (val.length > 2) {
            val = `${val.slice(0, 2)}/${val.slice(2)}`;
        }
        
        onChange(val); 
        
        // If valid full date, update calendar view
        if (val.length === 10) {
            setViewDate(parseDate(val));
        }
    }

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false)
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
    const years = Array.from({length: 80}, (_, i) => new Date().getFullYear() - 60 + i) // range -60 to +20 years

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

    const currentYear = viewDate.getFullYear()
    const currentMonth = viewDate.getMonth()
    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

    const handleDateClick = (day: number) => {
        // Format: DD/MM/YYYY
        const dd = String(day).padStart(2, '0');
        const mm = String(currentMonth + 1).padStart(2, '0');
        const yyyy = currentYear;
        onChange(`${dd}/${mm}/${yyyy}`)
        setIsOpen(false)
    }

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate)
        newDate.setMonth(newDate.getMonth() + offset)
        setViewDate(newDate)
    }
    
    const changeYear = (year: number) => {
        const newDate = new Date(viewDate)
        newDate.setFullYear(year)
        setViewDate(newDate)
    }

    return (
        <div className="relative" ref={ref}>
             <label className="block text-xs font-bold text-gray-500 mb-1.5 ml-1">{label}</label>
             <div className="relative">
                <input
                    type="text"
                    className="w-full bg-gray-50 border border-transparent text-gray-900 text-sm rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 block p-3 pr-10 transition-all outline-none placeholder-gray-400 font-medium"
                    placeholder="DD/MM/YYYY"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    maxLength={10}
                />
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
             </div>

             {isOpen && (
                <div className="absolute top-full mt-2 left-0 w-[280px] bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-gray-900">{months[currentMonth]}</span>
                            <select 
                                value={currentYear} 
                                onChange={(e) => changeYear(Number(e.target.value))}
                                className="text-sm font-bold text-gray-900 bg-transparent border-none outline-none cursor-pointer hover:text-blue-600"
                            >
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {days.map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1
                            const dd = String(day).padStart(2, '0');
                            const mm = String(currentMonth + 1).padStart(2, '0');
                            const yyyy = currentYear;
                            const dateStr = `${dd}/${mm}/${yyyy}`;
                            
                            const isSelected = value === dateStr
                            return (
                                <button
                                    key={day}
                                    onClick={() => handleDateClick(day)}
                                    className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${isSelected ? 'bg-black text-white shadow-lg shadow-black/20' : 'hover:bg-gray-100 text-gray-700'}`}
                                >
                                    {day}
                                </button>
                            )
                        })}
                    </div>
                </div>
             )}
        </div>
    )
}