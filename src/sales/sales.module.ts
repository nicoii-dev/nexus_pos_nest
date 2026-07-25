import { Module } from '@nestjs/common';

import { EnvConfigModule } from '../env-config/env-config.module';
import { SupabaseModule } from '../lib/supabase/supabase.module';

import { SalesController } from './sales.controller';
import { SalesRepository } from './sales.repository';
import { SalesService } from './sales.service';

@Module({
  imports: [SupabaseModule, EnvConfigModule],
  controllers: [SalesController],
  providers: [SalesService, SalesRepository],
  exports: [SalesService],
})
export class SalesModule {}
