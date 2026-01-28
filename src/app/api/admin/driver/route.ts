import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

// Service Role Client (Bypasses RLS for administrative tasks)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
      console.warn(`🚨 Unauthorized driver creation attempt by: ${user.email}`)
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 })
    }

    // 3. Parse and Sanitize Body
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

    if (!first_name || !last_initial) {
      return NextResponse.json({ error: "Missing required identity fields" }, { status: 400 })
    }

    // 4. Create Driver (Public Record)
    const { data: driver, error: dErr } = await supabaseAdmin
      .from("drivers")
      .insert({
        first_name: first_name.trim(),
        last_initial: last_initial.trim().toUpperCase(),
        city: city?.trim() || null,
        state: state?.trim()?.toUpperCase() || null,
        experience_years: Number(experience_years) || 0,
        endorsements: Array.isArray(endorsements) ? endorsements : [],
        driver_type: driver_type === "owner_operator" ? "owner_operator" : "company",
        dob: dob || null,
        living_city: living_city?.trim() || null,
        living_state: living_state?.trim()?.toUpperCase() || null,
      })
      .select("id")
      .single()

    if (dErr || !driver) {
      console.error("❌ Failed to create public driver record:", dErr?.message)
      return NextResponse.json({ error: dErr?.message || "Failed to create driver" }, { status: 400 })
    }

    // 5. Create Driver Private Data
    const { error: pErr } = await supabaseAdmin.from("driver_private").insert({
      driver_id: driver.id,
      phone: phone?.trim() || null,
      email: email?.trim()?.toLowerCase() || null,
      cdl_number: cdl_number?.trim() || null,
    })

    // Rollback Pattern: Maintain data hygiene across tables
    if (pErr) {
      console.error("❌ Failed to create private driver record, rolling back public record:", pErr.message)
      await supabaseAdmin.from("drivers").delete().eq("id", driver.id)
      return NextResponse.json({ error: `Private data error: ${pErr.message}` }, { status: 400 })
    }

    console.log(`✅ Admin ${user.email} created Driver ID: ${driver.id}`)
    return NextResponse.json({ ok: true, id: driver.id })

  } catch (err: any) {
    console.error("❌ Admin POST Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    // 1. Auth & Role Verification
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("user_id", user.id)
      .single()

    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    // 2. Identify Target
    const body = await req.json()
    const driverId = body?.driverId

    if (!driverId) return NextResponse.json({ error: "Missing Driver ID" }, { status: 400 })

    // 3. Execution (Cascading deletes should be handled at DB level, otherwise delete private manually first)
    // Assuming you have 'ON DELETE CASCADE' in your Postgres schema
    const { error } = await supabaseAdmin
      .from("drivers")
      .delete()
      .eq("id", driverId)

    if (error) {
      console.error(`❌ Admin failed to delete Driver ${driverId}:`, error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log(`🗑️ Admin ${user.email} deleted Driver ID: ${driverId}`)
    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error("❌ Admin DELETE Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}