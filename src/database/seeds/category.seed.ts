import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SeedCategory {
  name: string;
  description: string;
}

const categories: SeedCategory[] = [
  {
    name: 'Snacks & Sweets',
    description:
      'Chips, biscuits, candies, and chocolates sold in small packs or jars.',
  },
  {
    name: 'Beverages',
    description:
      'Soft drinks, bottled water, juices, and energy drinks (often chilled), plus 3-in-1 coffee and powdered milk.',
  },
  {
    name: 'Pantry Staples',
    description:
      'Instant noodles, canned sardines, corned beef, and tuna flakes.',
  },
  {
    name: 'Cooking Essentials',
    description:
      'Cooking oil, sugar, salt, soy sauce, vinegar, fish sauce, and seasoning mixes.',
  },
  {
    name: 'Toiletries',
    description:
      'Single-use shampoo, soap, toothpaste, and lotion.',
  },
  {
    name: 'Cleaning Supplies',
    description:
      'Laundry detergent powder, fabric softener, and dishwashing liquid in sachets.',
  },
  {
    name: 'Baby & Sanitary Products',
    description: 'Diapers and sanitary napkins.',
  },
  {
    name: 'Health & OTC Items',
    description:
      'Rubbing alcohol, liniment oil, and pain-relief patches.',
  },
  {
    name: 'Adult Goods',
    description: 'Cigarettes and select alcoholic beverages.',
  },
  {
    name: 'Digital Services',
    description:
      'Prepaid mobile phone load and electronic wallet cash-in.',
  },
  {
    name: 'School Supplies',
    description: 'Notebooks, pens, and pencils.',
  },
];

async function seed() {
  console.log('🌱 Seeding categories...\n');

  const { data: existing, error: fetchError } = await supabase
    .from('categories')
    .select('name');

  if (fetchError) {
    console.error('❌ Failed to fetch existing categories:', fetchError.message);
    process.exit(1);
  }

  const existingNames = new Set(existing?.map((c) => c.name) ?? []);

  let inserted = 0;
  let skipped = 0;

  for (const cat of categories) {
    if (existingNames.has(cat.name)) {
      console.log(`⚠️  "${cat.name}" already exists — skipping`);
      skipped++;
      continue;
    }

    const { error } = await supabase
      .from('categories')
      .insert({ name: cat.name, description: cat.description });

    if (error) {
      console.error(`❌ Failed to insert "${cat.name}":`, error.message);
      continue;
    }

    console.log(`✅ Created category → ${cat.name}`);
    inserted++;
  }

  console.log(`\n🎉 Done! ${inserted} inserted, ${skipped} skipped.`);
}

seed().catch((err) => {
  console.error('❌ Seeder crashed:', err);
  process.exit(1);
});
