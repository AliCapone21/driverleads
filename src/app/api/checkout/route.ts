import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(req: Request) {
  try {
    // 1. Foydalanuvchini tekshirish
    const supabase = await createClient()
    const { data: { user }, error: userErr } = await supabase.auth.getUser()

    if (userErr || !user) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 })
    }

    // 2. Body ma'lumotlarini olish
    const body = await req.json().catch(() => ({}))
    const { driverId, productId } = body as { driverId?: string; productId?: string }

    // Konfiguratsiya
    const apiKey = process.env.DODO_PAYMENTS_API_KEY
    const defaultProductId = process.env.DODO_PRODUCT_ID
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!apiKey || !siteUrl) {
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 })
    }

    // 3. Driver Unlock mantiqi (agar bu haydovchini ochish bo'lsa)
    if (driverId) {
      const { data: existing } = await supabase
        .from("unlocks")
        .select("id")
        .eq("user_id", user.id)
        .eq("driver_id", driverId)
        .maybeSingle()
      
      if (existing) {
        return NextResponse.json({ error: "Already unlocked.", code: "ALREADY_UNLOCKED" }, { status: 400 })
      }
    }

    const targetProductId = productId || defaultProductId
    if (!targetProductId) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 })
    }

    // 4. Dodo Payments uchun Payload (product_cart bilan)
    const dodoPayload = {
      product_cart: [
        {
          product_id: targetProductId,
          quantity: 1,
        }
      ],
      customer: {
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0], // Ismni ham yuborish tavsiya etiladi
      },
      metadata: {
        driverId: driverId || "donation",
        userId: user.id,
      },
      return_url: driverId 
        ? `${siteUrl}/drivers/${driverId}?status=success`
        : `${siteUrl}/about?status=thank_you`,
    }

    console.log("📤 Sending to Dodo:", JSON.stringify(dodoPayload, null, 2))

    // 5. So'rovni yuborish
    const response = await fetch("https://test.dodopayments.com/checkouts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dodoPayload),
    })

    const session = await response.json()

    if (!response.ok) {
      console.error("❌ Dodo API Error:", session)
      throw new Error(session.message || "Dodo API Error")
    }

    return NextResponse.json({ url: session.checkout_url })

  } catch (error: any) {
    console.error("❌ Checkout Error:", error.message)
    return NextResponse.json({ 
      error: error.message || "Internal Server Error",
      cause: error.cause?.message
    }, { status: 500 })
  }
}