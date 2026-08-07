-- Track payment transfers between payment types (e.g. card to cash)
CREATE TABLE IF NOT EXISTS payment_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  sale_payment_id UUID,
  from_payment_type TEXT NOT NULL CHECK (from_payment_type IN ('cash', 'card', 'digital')),
  to_payment_type TEXT NOT NULL CHECK (to_payment_type IN ('cash', 'card', 'digital')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  reason TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_transfers_sale ON payment_transfers(sale_id);
CREATE INDEX IF NOT EXISTS idx_payment_transfers_created_at ON payment_transfers(created_at);

ALTER TABLE payment_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read payment_transfers" ON payment_transfers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Service role full access payment_transfers" ON payment_transfers FOR ALL USING (auth.role() = 'service_role');
