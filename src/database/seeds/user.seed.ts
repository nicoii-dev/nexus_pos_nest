import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SeedUser {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'cashier';
}

const users: SeedUser[] = [
  {
    email: 'admin@nexus-pos.com',
    password: 'P@ssw0rd',
    name: 'System Admin',
    role: 'admin',
  },
  {
    email: 'manager@nexus-pos.com',
    password: 'P@ssw0rd',
    name: 'Store Manager',
    role: 'manager',
  },
  {
    email: 'cashier@nexus-pos.com',
    password: 'P@ssw0rd',
    name: 'Staff Cashier',
    role: 'cashier',
  },
];

async function seed() {
  console.log('🌱 Seeding user accounts...\n');

  for (const user of users) {
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          role: user.role,
        },
      });

    if (authError) {
      if (authError.message.includes('already exists')) {
        console.log(`⚠️  ${user.email} already exists — skipping`);
        continue;
      }
      console.error(`❌ Failed to create ${user.email}:`, authError.message);
      continue;
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    if (profileError) {
      console.error(
        `❌ Auth user created but profile insert failed for ${user.email}:`,
        profileError.message,
      );
      continue;
    }

    console.log(
      `✅ Created ${user.role.padEnd(8)} → ${user.email} (${user.name})`,
    );
  }

  console.log('\n🎉 Seeding complete!');
}

seed().catch((err) => {
  console.error('❌ Seeder crashed:', err);
  process.exit(1);
});
