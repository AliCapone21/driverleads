import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server" // <--- User session (Cookies)
import { createClient as createAdminClient } from "@supabase/supabase-js" // <--- Admin powers

// Service Role Client (For signing URLs and reading private tables)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // 1. Verify User (Cookies)
    const supabase = await createClient()
    const { data: { user }, error: userErr } = await supabase.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Parse Body
    const { driverId } = (await req.json()) as { driverId?: string }
    if (!driverId) return NextResponse.json({ error: "Missing driverId" }, { status: 400 })

    // 3. Verify Unlock (Does this user own an unlock for this driver?)
    // We use supabaseAdmin here just to be safe, or you can use regular supabase if RLS allows reading 'unlocks'
    const { data: unlocked } = await supabaseAdmin
      .from("unlocks")
      .select("id")
      .eq("user_id", user.id)
      .eq("driver_id", driverId)
      .maybeSingle()

    if (!unlocked) {
      return NextResponse.json({ error: "Not unlocked. Please purchase access first." }, { status: 403 })
    }

    // 4. Get File Path from Private Table
    const { data: priv } = await supabaseAdmin
      .from("driver_private")
      .select("cdl_file_path")
      .eq("driver_id", driverId)
      .maybeSingle()

    const path = priv?.cdl_file_path
    if (!path) return NextResponse.json({ error: "No CDL file found for this driver" }, { status: 404 })

    // 5. Generate Signed URL (Valid for 60 seconds)
    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("cdl-files")
      .createSignedUrl(path, 60)

    if (sErr || !signed?.signedUrl) {
      return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 })
    }

    return NextResponse.json({ url: signed.signedUrl })

  } catch (err) {
    console.error("Download Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}