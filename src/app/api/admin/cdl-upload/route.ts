import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

// Initialize Admin Client
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALLOWED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg"]
const ALLOWED_MIME_TYPES = ["application/pdf", "image/png", "image/jpeg"]

export async function POST(req: Request) {
  try {
    // 1. Verify User Session
    const supabase = await createClient()
    const { data: { user }, error: userErr } = await supabase.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Strict Admin Role Check
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single()

    if (profile?.role !== "admin") {
      console.warn(`🚨 Unauthorized upload attempt by user: ${user.id}`)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // 3. Parse and Validate Form Data
    const formData = await req.formData()
    const driverId = formData.get("driverId") as string
    const file = formData.get("file") as File | null

    if (!driverId || !file) {
      return NextResponse.json({ error: "Missing driverId or file" }, { status: 400 })
    }

    // 4. File Security Hardening
    const ext = file.name.split(".").pop()?.toLowerCase() || ""
    
    // Check extension AND MIME type for double security
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only PDF and Images allowed." }, { status: 400 })
    }

    // Path: <driverId>/cdl_<timestamp>.<ext> (Adding timestamp prevents browser caching issues)
    const path = `${driverId}/cdl_${Date.now()}.${ext}`
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 5. Upload to Storage
    const { error: upErr } = await supabaseAdmin.storage
      .from("cdl-files")
      .upload(path, buffer, {
        upsert: true,
        contentType: file.type,
      })

    if (upErr) {
      console.error("❌ Storage Upload Failed:", upErr.message)
      return NextResponse.json({ error: "Storage Error: " + upErr.message }, { status: 400 })
    }

    // 6. Update Database Record
    const { error: dbErr } = await supabaseAdmin
      .from("driver_private")
      .update({ cdl_file_path: path })
      .eq("driver_id", driverId)

    if (dbErr) {
      console.error("❌ DB Update Failed, rolling back file:", dbErr.message)
      // Cleanup: Delete the file if DB fails so we don't have orphan files
      await supabaseAdmin.storage.from("cdl-files").remove([path])
      return NextResponse.json({ error: "DB Error: " + dbErr.message }, { status: 400 })
    }

    console.log(`✅ CDL Uploaded successfully for Driver: ${driverId}`)
    return NextResponse.json({ ok: true, path })

  } catch (err) {
    console.error("❌ Internal Upload Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}