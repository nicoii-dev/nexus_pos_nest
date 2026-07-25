import { Global, Module } from '@nestjs/common';

import { EnvConfigModule } from '../../env-config/env-config.module';

import { SupabaseService } from './supabase.service';

@Global()
@Module({
  imports: [EnvConfigModule],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
