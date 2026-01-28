// src/app/api/cdl-download/route.ts

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

// Service Role Client: Required to sign URLs for private buckets
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // 1. Verify Authentication via Session Cookies
    const supabase = await createClient()
    const { data: { user }, error: userErr } = await supabase.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Parse and Validate Request Body
    const body = await req.json().catch(() => ({}))
    const { driverId } = body as { driverId?: string }

    if (!driverId) {
      return NextResponse.json({ error: "Missing Driver ID" }, { status: 400 })
    }

    // 3. Verify Purchase (Gating logic)
    // We check the 'unlocks' table to ensure this specific user has paid for this driver
    const { data: unlocked, error: unlockErr } = await supabaseAdmin
      .from("unlocks")
      .select("id")
      .eq("user_id", user.id)
      .eq("driver_id", driverId)
      .maybeSingle()

    if (unlockErr) {
      console.error("❌ Verification Error:", unlockErr.message)
      return NextResponse.json({ error: "Verification failed" }, { status: 500 })
    }

    if (!unlocked) {
      console.warn(`🚨 Unauthorized download attempt: User ${user.email} -> Driver ${driverId}`)
      return NextResponse.json({ error: "Access denied. Please purchase this profile first." }, { status: 403 })
    }

    // 4. Retrieve Storage Path
    const { data: priv, error: privErr } = await supabaseAdmin
      .from("driver_private")
      .select("cdl_file_path")
      .eq("driver_id", driverId)
      .maybeSingle()

    if (privErr || !priv?.cdl_file_path) {
      console.error("❌ File Path Not Found:", privErr?.message)
      return NextResponse.json({ error: "CDL file record not found for this driver" }, { status: 404 })
    }

    // 5. Generate Temporary Signed URL
    // Valid for 60 seconds - enough for the browser to initiate the download
    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("cdl-files")
      .createSignedUrl(priv.cdl_file_path, 60, {
        download: true, // Forces the browser to download rather than preview
      })

    if (sErr || !signed?.signedUrl) {
      console.error("❌ Signed URL Generation Failed:", sErr?.message)
      return NextResponse.json({ error: "Failed to generate secure download link" }, { status: 500 })
    }

    console.log(`✅ Secure download generated: User ${user.email} -> Driver ${driverId}`)

    return NextResponse.json({ url: signed.signedUrl })

  } catch (err) {
    console.error("❌ CDL Download API Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}