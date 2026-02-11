// src/lib/dodo.ts

export const DODO_CONFIG = {
  apiKey: process.env.DODO_PAYMENTS_API_KEY!,
  baseUrl: "https://api.dodopayments.com/v1",
  productId: process.env.DODO_PRODUCT_ID!,
  donationProductId: process.env.NEXT_PUBLIC_DODO_DONATION_PRODUCT_ID!,
}

// Helper to check if config is missing
export const validateDodoConfig = () => {
  const missing = Object.entries(DODO_CONFIG).filter(([_, value]) => !value);
  if (missing.length > 0) {
    throw new Error(`❌ Dodo Configuration Error: Missing ${missing.map(([k]) => k).join(", ")}`);
  }
};