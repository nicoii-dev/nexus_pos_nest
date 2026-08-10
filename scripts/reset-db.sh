#!/usr/bin/env bash
set -euo pipefail

echo "==> Resetting data only (schema is kept)..."

# Wipe all business data (CASCADE handles foreign-key dependencies)
npx supabase db query --linked "
TRUNCATE TABLE
  payment_transfers,
  sale_items,
  sales,
  inventory_movements,
  products,
  customers,
  categories,
  branches,
  settings,
  profiles
CASCADE;
"

# Remove auth users so the user seeder can recreate them cleanly
npx supabase db query --linked "DELETE FROM auth.users;"

echo "==> Seeding users..."
npm run seed:users

echo "==> Seeding categories..."
npm run seed:categories

echo "==> Done! Data reset and seeded successfully."
