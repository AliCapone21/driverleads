import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

// Initialize Admin Client with Service Role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  // 1. Validate configuration and signature
  if (!sig || !webhookSecret) {
    console.error("❌ Webhook Error: Missing signature or STRIPE_WEBHOOK_SECRET env var")
    return NextResponse.json({ error: "Configuration Error" }, { status: 400 })
  }

  const body = await req.text()
  let event

  // 2. Construct and verify the event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`❌ Webhook Signature Error: ${err.message}`)
    return NextResponse.json({ error: `Invalid Signature: ${err.message}` }, { status: 400 })
  }

  // 3. Handle successful checkout payments
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any // Stripe.Checkout.Session
    
    const driverId = session?.metadata?.driverId
    const userId = session?.metadata?.userId
    const paymentIntent = session?.payment_intent as string

    // If metadata is missing, something went wrong in checkout session creation
    if (!driverId || !userId) {
      console.error("⚠️ Webhook Error: Missing driverId or userId in session metadata", session.id)
      return NextResponse.json({ received: true, warning: "Missing metadata" }, { status: 200 })
    }

    console.log(`🔔 Processing unlock for User: ${userId} -> Driver: ${driverId}`)

    // 4. Upsert the unlock record using Admin powers
    const { error } = await supabaseAdmin.from("unlocks").upsert(
      {
        user_id: userId,
        driver_id: driverId,
        stripe_payment_intent: paymentIntent || `session_${session.id}`,
      },
      { onConflict: "user_id,driver_id" }
    )
    
    if (error) {
      console.error("❌ Supabase Access Grant Failed:", error.message)
      // Return 500 so Stripe retries the webhook until the DB is available
      return NextResponse.json({ error: "Database write failed" }, { status: 500 })
    }
    
    console.log(`✅ Access granted successfully: User ${userId} unlocked Driver ${driverId}`)
  }

  // 5. Always return 200 for unhandled events to acknowledge receipt
  return NextResponse.json({ received: true }, { status: 200 })
}