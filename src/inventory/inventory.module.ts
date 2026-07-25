import { Module } from '@nestjs/common';

import { EnvConfigModule } from '../env-config/env-config.module';
import { SupabaseModule } from '../lib/supabase/supabase.module';

import { InventoryController } from './inventory.controller';
import { InventoryRepository } from './inventory.repository';
import { InventoryService } from './inventory.service';

@Module({
  imports: [SupabaseModule, EnvConfigModule],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository],
  exports: [InventoryService],
})
export class InventoryModule {}
