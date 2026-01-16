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
    const body = await req.json()
    const accessToken = body?.accessToken as string | undefined

    const auth = await requireAdmin(accessToken)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 403 })
    }

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

    // create driver (public)
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
        dob: dob ? dob : null,
        living_city: living_city ? living_city : null,
        living_state: living_state ? living_state : null,
      })
      .select("id")
      .single()

    if (dErr || !driver) {
      return NextResponse.json(
        { error: dErr?.message ?? "Create failed" },
        { status: 400 }
      )
    }

    // create private
    const { error: pErr } = await supabaseAdmin.from("driver_private").insert({
      driver_id: driver.id,
      phone: phone ?? null,
      email: email ?? null,
      cdl_number: cdl_number ?? null,
    })

    if (pErr) {
      await supabaseAdmin.from("drivers").delete().eq("id", driver.id)
      return NextResponse.json({ error: pErr.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, id: driver.id })
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const accessToken = body?.accessToken as string | undefined
    const driverId = body?.driverId as string | undefined

    const auth = await requireAdmin(accessToken)
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 403 })
    }

    if (!driverId) {
      return NextResponse.json({ error: "Missing driverId" }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from("drivers")
      .delete()
      .eq("id", driverId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 })
  }
}
