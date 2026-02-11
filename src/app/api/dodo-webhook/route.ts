import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Webhook } from "standardwebhooks";

// Initialize Admin Client with Service Role to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const rawBody = await req.text();
  const headers = req.headers;
  
  // 1. Extract Dodo/Standard Webhook headers
  const webhookId = headers.get("webhook-id");
  const webhookSignature = headers.get("webhook-signature");
  const webhookTimestamp = headers.get("webhook-timestamp");
  const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;

  // 2. Validate configuration
  if (!webhookSecret || !webhookSignature || !webhookId || !webhookTimestamp) {
    console.error("❌ Webhook Error: Missing required Dodo headers or Secret Key");
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // 3. Verify Signature using standardwebhooks library
  try {
    const wh = new Webhook(webhookSecret);
    wh.verify(rawBody, {
      "webhook-id": webhookId,
      "webhook-signature": webhookSignature,
      "webhook-timestamp": webhookTimestamp,
    });
  } catch (err: any) {
    console.error(`❌ Webhook Signature Verification Failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
  }

  // 4. Parse Event
  const event = JSON.parse(rawBody);

  // 5. Handle successful payments
  // Dodo event type for successful payment is "payment.succeeded"
  if (event.type === "payment.succeeded") {
    const paymentData = event.data;
    const metadata = paymentData?.metadata;
    
    const driverId = metadata?.driverId;
    const userId = metadata?.userId;
    const paymentId = paymentData?.payment_id;

    // Acknowledge donations without DB write
    if (driverId === "donation") {
      console.log(`🎁 Donation received from User: ${userId || 'Anonymous'}`);
      return NextResponse.json({ received: true, message: "Donation acknowledged" });
    }

    // Ensure metadata exists for driver unlocks
    if (!driverId || !userId) {
      console.error("⚠️ Webhook Error: Missing driverId or userId in metadata", paymentId);
      return NextResponse.json({ received: true, warning: "Missing metadata" });
    }

    console.log(`🔔 Processing unlock for User: ${userId} -> Driver: ${driverId}`);

    // 6. Grant access in Supabase
    const { error } = await supabaseAdmin.from("unlocks").upsert(
      {
        user_id: userId,
        driver_id: driverId,
        // Using existing column name, prefixing with dodo_ for tracking
        stripe_payment_intent: `dodo_${paymentId}`,
      },
      { onConflict: "user_id,driver_id" }
    );
    
    if (error) {
      console.error("❌ Supabase Database Update Failed:", error.message);
      // Return 500 so Dodo retries the webhook until the DB is reachable
      return NextResponse.json({ error: "Database write failed" }, { status: 500 });
    }
    
    console.log(`✅ Access granted successfully: User ${userId} unlocked Driver ${driverId}`);
  }

  // Always return 200 for other events to stop Dodo from retrying
  return NextResponse.json({ received: true }, { status: 200 });
}