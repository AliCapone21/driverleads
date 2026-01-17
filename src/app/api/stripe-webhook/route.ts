import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 })

  // ✅ FIXED: Use req.text() for reliable signature verification
  const body = await req.text()

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook Signature Error:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Handle successful checkout payments
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any
    const driverId = session?.metadata?.driverId as string | undefined
    const userId = session?.metadata?.userId as string | undefined
    const paymentIntent = session?.payment_intent as string | undefined

    if (driverId && userId) {
      // Use service role to bypass RLS in webhook (server-to-server)
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const { error } = await supabaseAdmin.from("unlocks").upsert(
        {
          user_id: userId,
          driver_id: driverId,
          stripe_payment_intent: paymentIntent ?? "stripe_session_completed",
        },
        { onConflict: "user_id,driver_id" }
      )
      
      if (error) console.error("Supabase Write Error:", error)
    }
  }

  return NextResponse.json({ received: true })
}