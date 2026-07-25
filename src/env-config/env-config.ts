import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(5000),
  SUPABASE_JWT_SECRET: z.string(),
  SUPABASE_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_ROLE_KEY: z.string(),
  CLIENT_URL: z.string(),
});

export type EnvironmentVariables = z.infer<typeof envSchema>;
