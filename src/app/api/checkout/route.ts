import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/utils/supabase/server"

export async function POST(req: Request) {
  try {
    // 1. Verify User Authentication
    const supabase = await createClient()
    const { data: { user }, error: userErr } = await supabase.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
    }

    // 2. Parse and Validate Body
    const body = await req.json().catch(() => ({}))
    const { driverId } = body as { driverId?: string }
    
    if (!driverId) {
      return NextResponse.json({ error: "Driver ID is required for checkout." }, { status: 400 })
    }

    const priceId = process.env.STRIPE_PRICE_ID
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!priceId || !siteUrl) {
      console.error("❌ Configuration Error: Missing STRIPE_PRICE_ID or NEXT_PUBLIC_SITE_URL")
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 })
    }

    // 3. Prevent Double Purchase
    // Check if the user already has an active unlock for this driver
    const { data: existing } = await supabase
      .from("unlocks")
      .select("id")
      .eq("user_id", user.id)
      .eq("driver_id", driverId)
      .maybeSingle()
    
    if (existing) {
      return NextResponse.json({ 
        error: "You have already unlocked this driver.",
        code: "ALREADY_UNLOCKED" 
      }, { status: 400 })
    }

    console.log(`💳 Initiating checkout: User ${user.email} -> Driver ${driverId}`)

    // 4. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      payment_method_types: ["card"], // Explicitly set allowed methods
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Success/Cancel handling with clean URL construction
      success_url: `${siteUrl}/drivers/${driverId}?paid=1`,
      cancel_url: `${siteUrl}/drivers/${driverId}?canceled=1`,
      metadata: {
        driverId,
        userId: user.id,
      },
    })

    if (!session.url) {
      throw new Error("Stripe failed to generate a session URL.")
    }

    return NextResponse.json({ url: session.url })

  } catch (error: any) {
    console.error("❌ Checkout API Error:", error.message)
    return NextResponse.json({ 
      error: error.message || "An unexpected error occurred during checkout." 
    }, { status: 500 })
  }
}