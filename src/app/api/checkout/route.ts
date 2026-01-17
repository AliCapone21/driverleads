import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const { driverId, accessToken } = (await req.json()) as {
      driverId?: string
      accessToken?: string
    }

    if (!driverId) {
      return NextResponse.json({ error: "Missing driverId" }, { status: 400 })
    }
    if (!accessToken) {
      return NextResponse.json({ error: "Missing accessToken" }, { status: 401 })
    }

    // Supabase client with user JWT so we can read user identity
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      }
    )

    const { data: userData, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const userId = userData.user.id
    const userEmail = userData.user.email ?? undefined

    // Guard: Check if already unlocked
    const { data: existing } = await supabase
      .from("unlocks")
      .select("id")
      .eq("user_id", userId)
      .eq("driver_id", driverId)
      .maybeSingle()
    
    if (existing) {
      return NextResponse.json(
        { error: "Already unlocked" },
        { status: 400 }
      )
    }

    // ✅ FIXED: Using STRIPE_PRICE_ID and NEXT_PUBLIC_SITE_URL
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: userEmail,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // Use the ID you just created
          quantity: 1,
        },
      ],
      // Make sure this variable matches your Vercel Env Var
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/drivers/${driverId}?paid=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/drivers/${driverId}?canceled=1`,
      metadata: {
        driverId,
        userId,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout Error:", error)
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 400 })
  }
}