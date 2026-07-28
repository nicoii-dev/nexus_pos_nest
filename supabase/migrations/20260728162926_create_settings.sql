CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL DEFAULT 'Nexus POS Store',
  logo TEXT,
  currency TEXT NOT NULL DEFAULT 'PHP',
  timezone TEXT NOT NULL DEFAULT 'Asia/Manila',
  tax_rate NUMERIC NOT NULL DEFAULT 12,
  receipt_header TEXT NOT NULL DEFAULT 'Thank you for shopping!',
  receipt_footer TEXT NOT NULL DEFAULT 'Please come again.',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
