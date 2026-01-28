import { Suspense } from "react"
import JoinClient from "@/components/JoinClient"

export const dynamic = "force-dynamic"

export default function JoinPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#070A12] flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="h-12 w-12 rounded-full border-2 border-white/5" />
                    <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Establishing Secure Uplink</p>
            </div>
        }>
            <JoinClient />
        </Suspense>
    )
}