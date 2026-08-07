import { Module } from '@nestjs/common';

import { EnvConfigModule } from '../env-config/env-config.module';
import { SupabaseModule } from '../lib/supabase/supabase.module';

import { PaymentTransfersController } from './payment-transfers.controller';
import { PaymentTransfersRepository } from './payment-transfers.repository';
import { PaymentTransfersService } from './payment-transfers.service';

@Module({
  imports: [SupabaseModule, EnvConfigModule],
  controllers: [PaymentTransfersController],
  providers: [PaymentTransfersService, PaymentTransfersRepository],
  exports: [PaymentTransfersService],
})
export class PaymentTransfersModule {}
