import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/utils/supabase/server" // <--- User session (Cookies)

export async function POST(req: Request) {
  try {
    // 1. Verify User
    const supabase = await createClient()
    const { data: { user }, error: userErr } = await supabase.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Parse Body
    const { driverId } = (await req.json()) as { driverId?: string }
    if (!driverId) return NextResponse.json({ error: "Missing driverId" }, { status: 400 })

    const userId = user.id
    const userEmail = user.email

    // 3. Guard: Check if already unlocked
    const { data: existing } = await supabase
      .from("unlocks")
      .select("id")
      .eq("user_id", userId)
      .eq("driver_id", driverId)
      .maybeSingle()
    
    if (existing) {
      return NextResponse.json({ error: "You have already unlocked this driver." }, { status: 400 })
    }

    // 4. Create Stripe Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: userEmail,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // Ensure this ENV var is set in Vercel!
          quantity: 1,
        },
      ],
      // Dynamic success/cancel URLs
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/drivers/${driverId}?paid=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/drivers/${driverId}?canceled=1`,
      metadata: {
        driverId,
        userId,
      },
    })

    if (!session.url) {
        throw new Error("Stripe failed to return a session URL.")
    }

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error("Checkout Error:", error)
    return NextResponse.json({ error: error.message || "Failed to create checkout" }, { status: 500 })
  }
}