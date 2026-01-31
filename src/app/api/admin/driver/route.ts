// src/app/api/admin/driver/route.ts

import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

// Service Role Client (Bypasses RLS for administrative tasks)
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr || !user) {
    return { ok: false as const, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  const { data: profile, error: roleErr } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (roleErr) {
    console.error("❌ Role lookup failed:", roleErr.message)
    return { ok: false as const, res: NextResponse.json({ error: "Role check failed" }, { status: 500 }) }
  }

  if (profile?.role !== "admin") {
    console.warn(`🚨 Forbidden admin action attempt by: ${user.email}`)
    return { ok: false as const, res: NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 }) }
  }

  return { ok: true as const, user }
}

const toNumOrNull = (v: any) => {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export async function POST(req: Request) {
  try {
    // 1) Verify admin
    const admin = await requireAdmin()
    if (!admin.ok) return admin.res

    // 2) Parse and sanitize body
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

      // ✅ NEW fields
      status,
      expected_gross,
      expected_rpm,
      expected_cpm,
      expected_miles,

      // ✅ Optional: create Supabase Auth account for driver
      create_auth_user,
      password,
    } = body

    if (!first_name || !last_initial) {
      return NextResponse.json({ error: "Missing required identity fields" }, { status: 400 })
    }

    const safeStatus = status === "passive" || status === "active" ? status : "active"
    const safeDriverType = driver_type === "owner_operator" ? "owner_operator" : "company"
    const safeEndorsements = Array.isArray(endorsements) ? endorsements : []

    // 3) OPTIONAL: create auth user + link user_id on drivers
    let driverUserId: string | null = null
    if (create_auth_user) {
      if (!email || !password) {
        return NextResponse.json(
          { error: "To create auth user, email and password are required" },
          { status: 400 }
        )
      }

      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: String(email).trim().toLowerCase(),
        password: String(password),
        email_confirm: true,
      })

      if (createErr || !created?.user) {
        console.error("❌ Failed to create auth user:", createErr?.message)
        return NextResponse.json(
          { error: createErr?.message || "Failed to create auth user" },
          { status: 400 }
        )
      }

      driverUserId = created.user.id
    }

    // 4) Create driver (public record)
    const { data: driver, error: dErr } = await supabaseAdmin
      .from("drivers")
      .insert({
        user_id: driverUserId,

        first_name: String(first_name).trim(),
        last_initial: String(last_initial).trim().toUpperCase(),
        city: city?.trim() || null,
        state: state?.trim()?.toUpperCase() || null,
        experience_years: Number(experience_years) || 0,
        endorsements: safeEndorsements,
        driver_type: safeDriverType,

        status: safeStatus,

        dob: dob || null,
        living_city: living_city?.trim() || null,
        living_state: living_state?.trim()?.toUpperCase() || null,

        expected_gross: toNumOrNull(expected_gross),
        expected_rpm: toNumOrNull(expected_rpm),
        expected_cpm: toNumOrNull(expected_cpm),
        expected_miles: toNumOrNull(expected_miles),
      })
      .select("id, user_id")
      .single()

    if (dErr || !driver) {
      console.error("❌ Failed to create public driver record:", dErr?.message)

      // rollback auth user if created
      if (driverUserId) {
        await supabaseAdmin.auth.admin.deleteUser(driverUserId).catch(() => null)
      }

      return NextResponse.json({ error: dErr?.message || "Failed to create driver" }, { status: 400 })
    }

    // 5) Create private driver data
    const { error: pErr } = await supabaseAdmin.from("driver_private").insert({
      driver_id: driver.id,
      phone: phone?.trim() || null,
      email: email?.trim()?.toLowerCase() || null,
      cdl_number: cdl_number?.trim() || null,
    })

    if (pErr) {
      console.error("❌ Failed to create private driver record, rolling back public record:", pErr.message)

      await supabaseAdmin.from("drivers").delete().eq("id", driver.id)

      if (driver.user_id) {
        await supabaseAdmin.auth.admin.deleteUser(driver.user_id).catch(() => null)
      }

      return NextResponse.json({ error: `Private data error: ${pErr.message}` }, { status: 400 })
    }

    console.log(`✅ Admin ${admin.user.email} created Driver ID: ${driver.id}`)
    return NextResponse.json({ ok: true, id: driver.id })
  } catch (err: any) {
    console.error("❌ Admin POST Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    // 1) Verify admin
    const admin = await requireAdmin()
    if (!admin.ok) return admin.res

    // 2) Parse body
    const body = await req.json()
    const {
      driverId,

      // allowed updates
      status,
      driver_type,
      expected_gross,
      expected_rpm,
      expected_cpm,
      expected_miles,

      // optional: set/reset auth password for linked auth user
      password,
    } = body

    if (!driverId) {
      return NextResponse.json({ error: "Missing Driver ID" }, { status: 400 })
    }

    // 3) Build patch object (only provided values)
    const patch: Record<string, any> = {}

    if (status !== undefined) {
      const safeStatus = status === "active" || status === "passive" ? status : null
      if (!safeStatus) return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      patch.status = safeStatus
    }

    if (driver_type !== undefined) {
      const safeDriverType =
        driver_type === "owner_operator" || driver_type === "company" ? driver_type : null
      if (!safeDriverType) return NextResponse.json({ error: "Invalid driver_type" }, { status: 400 })
      patch.driver_type = safeDriverType
    }

    if (expected_gross !== undefined) patch.expected_gross = toNumOrNull(expected_gross)
    if (expected_rpm !== undefined) patch.expected_rpm = toNumOrNull(expected_rpm)
    if (expected_cpm !== undefined) patch.expected_cpm = toNumOrNull(expected_cpm)
    if (expected_miles !== undefined) patch.expected_miles = toNumOrNull(expected_miles)

    const wantsDriverUpdate = Object.keys(patch).length > 0

    // 4) Optional: update auth password if driver has user_id
    if (password !== undefined) {
      const pwd = String(password ?? "")
      if (pwd.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
      }

      const { data: row, error: readErr } = await supabaseAdmin
        .from("drivers")
        .select("user_id")
        .eq("id", driverId)
        .single()

      if (readErr) {
        return NextResponse.json({ error: readErr.message }, { status: 400 })
      }

      if (!row?.user_id) {
        return NextResponse.json(
          { error: "This driver has no linked auth user (user_id is null)" },
          { status: 400 }
        )
      }

      const { error: pwdErr } = await supabaseAdmin.auth.admin.updateUserById(row.user_id, {
        password: pwd,
      })

      if (pwdErr) {
        console.error("❌ Failed to update auth password:", pwdErr.message)
        return NextResponse.json({ error: pwdErr.message }, { status: 400 })
      }
    }

    // 5) Apply drivers table update if needed
    if (wantsDriverUpdate) {
      const { error: upErr } = await supabaseAdmin.from("drivers").update(patch).eq("id", driverId)
      if (upErr) {
        console.error("❌ Admin PATCH drivers update error:", upErr.message)
        return NextResponse.json({ error: upErr.message }, { status: 400 })
      }
    }

    if (!wantsDriverUpdate && password === undefined) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("❌ Admin PATCH Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    // 1) Verify admin
    const admin = await requireAdmin()
    if (!admin.ok) return admin.res

    // 2) Identify target
    const body = await req.json()
    const driverId = body?.driverId

    if (!driverId) return NextResponse.json({ error: "Missing Driver ID" }, { status: 400 })

    // 3) read user_id before delete (optional auth delete)
    const { data: row, error: readErr } = await supabaseAdmin
      .from("drivers")
      .select("user_id")
      .eq("id", driverId)
      .single()

    if (readErr) {
      console.error("❌ Failed to read driver before delete:", readErr.message)
      return NextResponse.json({ error: readErr.message }, { status: 400 })
    }

    // 4) delete private then public (safe even with cascade)
    await supabaseAdmin.from("driver_private").delete().eq("driver_id", driverId)
    const { error: delErr } = await supabaseAdmin.from("drivers").delete().eq("id", driverId)

    if (delErr) {
      console.error(`❌ Admin failed to delete Driver ${driverId}:`, delErr.message)
      return NextResponse.json({ error: delErr.message }, { status: 400 })
    }

    // 5) optional: delete auth user if exists
    if (row?.user_id) {
      await supabaseAdmin.auth.admin.deleteUser(row.user_id).catch(() => null)
    }

    console.log(`🗑️ Admin ${admin.user.email} deleted Driver ID: ${driverId}`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("❌ Admin DELETE Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
