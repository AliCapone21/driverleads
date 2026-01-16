import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { driverId, accessToken } = (await req.json()) as {
      driverId?: string
      accessToken?: string
    }

    if (!driverId) return NextResponse.json({ error: "Missing driverId" }, { status: 400 })
    if (!accessToken) return NextResponse.json({ error: "Missing token" }, { status: 401 })

    // Identify user from token
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    )

    const { data: userData, error: userErr } = await supabaseUser.auth.getUser()
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const userId = userData.user.id

    // Check unlock exists
    const { data: unlocked } = await supabaseAdmin
      .from("unlocks")
      .select("id")
      .eq("user_id", userId)
      .eq("driver_id", driverId)
      .maybeSingle()

    if (!unlocked) {
      return NextResponse.json({ error: "Not unlocked" }, { status: 403 })
    }

    // Get file path
    const { data: priv } = await supabaseAdmin
      .from("driver_private")
      .select("cdl_file_path")
      .eq("driver_id", driverId)
      .maybeSingle()

    const path = priv?.cdl_file_path
    if (!path) return NextResponse.json({ error: "No CDL uploaded" }, { status: 404 })

    // Create signed URL (60 seconds)
    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("cdl-files")
      .createSignedUrl(path, 60)

    if (sErr || !signed?.signedUrl) {
      return NextResponse.json({ error: sErr?.message ?? "Failed to sign URL" }, { status: 400 })
    }

    return NextResponse.json({ url: signed.signedUrl })
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}
