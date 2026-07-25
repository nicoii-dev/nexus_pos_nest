import { Module } from '@nestjs/common';

import { EnvConfigModule } from '../env-config/env-config.module';
import { SupabaseModule } from '../lib/supabase/supabase.module';

import { ReportsController } from './reports.controller';
import { ReportsRepository } from './reports.repository';
import { ReportsService } from './reports.service';

@Module({
  imports: [SupabaseModule, EnvConfigModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsRepository],
  exports: [ReportsService],
})
export class ReportsModule {}
