-- Add customer name to sales (nullable, defaults to NULL)
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT NULL;

-- Allow 'credit' payment method on sales
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_payment_method_check;
ALTER TABLE sales ADD CONSTRAINT sales_payment_method_check
  CHECK (payment_method IN ('cash', 'card', 'digital', 'credit'));

-- Allow 'credit' payment type in payment transfers
ALTER TABLE payment_transfers DROP CONSTRAINT IF EXISTS payment_transfers_from_payment_type_check;
ALTER TABLE payment_transfers ADD CONSTRAINT payment_transfers_from_payment_type_check
  CHECK (from_payment_type IN ('cash', 'card', 'digital', 'credit'));

ALTER TABLE payment_transfers DROP CONSTRAINT IF EXISTS payment_transfers_to_payment_type_check;
ALTER TABLE payment_transfers ADD CONSTRAINT payment_transfers_to_payment_type_check
  CHECK (to_payment_type IN ('cash', 'card', 'digital', 'credit'));
