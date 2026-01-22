import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server" // <--- User session (Cookies)
import { createClient as createAdminClient } from "@supabase/supabase-js" // <--- Admin powers

// 1. Service Role Client (Bypasses RLS)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // 2. Verify User (Using Cookies)
    const supabase = await createClient()
    const { data: { user }, error: userErr } = await supabase.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 3. Check Admin Role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 })
    }

    // 4. Parse Body
    const body = await req.json()
    const {
      first_name,
      last_initial,
      city,
      state,
      experience_years,
      endorsements,
      driver_type,
      dob,
      living_city,
      living_state,
      phone,
      email,
      cdl_number,
    } = body

    // 5. Create Driver (Public)
    const { data: driver, error: dErr } = await supabaseAdmin
      .from("drivers")
      .insert({
        first_name,
        last_initial,
        city,
        state,
        experience_years: Number(experience_years) || 0,
        endorsements: Array.isArray(endorsements) ? endorsements : [],
        driver_type: driver_type === "owner_operator" ? "owner_operator" : "company",
        dob: dob || null,
        living_city: living_city || null,
        living_state: living_state || null,
      })
      .select("id")
      .single()

    if (dErr || !driver) {
      return NextResponse.json({ error: dErr?.message || "Failed to create driver" }, { status: 400 })
    }

    // 6. Create Driver Private Data
    const { error: pErr } = await supabaseAdmin.from("driver_private").insert({
      driver_id: driver.id,
      phone: phone || null,
      email: email || null,
      cdl_number: cdl_number || null,
    })

    // Rollback if private data fails (clean data hygiene)
    if (pErr) {
      await supabaseAdmin.from("drivers").delete().eq("id", driver.id)
      return NextResponse.json({ error: pErr.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, id: driver.id })

  } catch (err: any) {
    console.error("Admin Create Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    // 1. Verify User
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

    // 3. Delete Driver
    const body = await req.json()
    const driverId = body?.driverId

    if (!driverId) return NextResponse.json({ error: "Missing Driver ID" }, { status: 400 })

    const { error } = await supabaseAdmin
      .from("drivers")
      .delete()
      .eq("id", driverId)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ ok: true })

  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}