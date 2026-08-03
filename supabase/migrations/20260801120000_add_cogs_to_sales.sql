-- Track cost of goods sold (COGS) for accurate profit reporting
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS cost NUMERIC NOT NULL DEFAULT 0;

ALTER TABLE sales ADD COLUMN IF NOT EXISTS total_cost NUMERIC NOT NULL DEFAULT 0;

-- Backfill cost for existing sale items from the product buying price
UPDATE sale_items si
SET cost = p.buying_price
FROM products p
WHERE si.product_id = p.id::text
  AND si.cost = 0;

-- Backfill total cost on existing sales
UPDATE sales s
SET total_cost = cogs.cost
FROM (
  SELECT sale_id, SUM(cost * quantity) AS cost
  FROM sale_items
  GROUP BY sale_id
) cogs
WHERE s.id = cogs.sale_id;
