import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server" // <--- User session (Cookies)
import { createClient as createAdminClient } from "@supabase/supabase-js" // <--- Admin powers

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // 1. Verify User (Cookies)
    const supabase = await createClient()
    const { data: { user }, error: userErr } = await supabase.auth.getUser()

    if (userErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // 2. Check Admin Role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single()

    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // 3. Parse Form Data
    const formData = await req.formData()
    const driverId = formData.get("driverId") as string
    const file = formData.get("file") as File | null

    if (!driverId || !file) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // 4. Prepare File
    // Path: private-drivers/<driverId>/cdl.<ext>
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin"
    const safeExt = ["pdf", "png", "jpg", "jpeg"].includes(ext) ? ext : "bin"
    const path = `${driverId}/cdl.${safeExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 5. Upload to Storage (Service Role)
    const { error: upErr } = await supabaseAdmin.storage
      .from("cdl-files") // Ensure this bucket exists in Supabase!
      .upload(path, buffer, {
        upsert: true,
        contentType: file.type || "application/octet-stream",
      })

    if (upErr) return NextResponse.json({ error: "Storage Error: " + upErr.message }, { status: 400 })

    // 6. Update Database Record
    const { error: dbErr } = await supabaseAdmin
      .from("driver_private")
      .update({ cdl_file_path: path })
      .eq("driver_id", driverId)

    if (dbErr) return NextResponse.json({ error: "DB Error: " + dbErr.message }, { status: 400 })

    return NextResponse.json({ ok: true, path })

  } catch (err) {
    console.error("Upload Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}