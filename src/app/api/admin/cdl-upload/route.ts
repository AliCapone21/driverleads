import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function requireAdmin(accessToken?: string) {
  if (!accessToken) return { ok: false as const, error: "Missing token" }

  const supabaseUser = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  )

  const { data: userData, error: userErr } = await supabaseUser.auth.getUser()
  if (userErr || !userData?.user) return { ok: false as const, error: "Invalid session" }

  const userId = userData.user.id

  const { data: prof } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle()

  if (prof?.role !== "admin") return { ok: false as const, error: "Not authorized" }

  return { ok: true as const, userId }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData()

    const accessToken = (form.get("accessToken") as string) || ""
    const driverId = (form.get("driverId") as string) || ""
    const file = form.get("file") as File | null

    const auth = await requireAdmin(accessToken)
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 403 })

    if (!driverId) return NextResponse.json({ error: "Missing driverId" }, { status: 400 })
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 })

    // Build path like: <driverId>/cdl.pdf (keeps each driver in their own folder)
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin"
    const safeExt = ["pdf", "png", "jpg", "jpeg"].includes(ext) ? ext : "bin"
    const path = `${driverId}/cdl.${safeExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to PRIVATE bucket
    const { error: upErr } = await supabaseAdmin.storage
      .from("cdl-files")
      .upload(path, buffer, {
        upsert: true,
        contentType: file.type || "application/octet-stream",
      })

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 })

    // Save path in driver_private
    const { error: dbErr } = await supabaseAdmin
      .from("driver_private")
      .update({ cdl_file_path: path })
      .eq("driver_id", driverId)

    if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 400 })

    return NextResponse.json({ ok: true, path })
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}
