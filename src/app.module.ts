import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtStrategy } from './auth/jwt.strategy';
import { LoginAttemptsService } from './auth/login-attempts.service';
import { BranchesModule } from './branches/branches.module';
import { CategoriesModule } from './categories/categories.module';
import { CustomersModule } from './customers/customers.module';
import { EnvironmentVariables, envSchema } from './env-config/env-config';
import { EnvConfigModule } from './env-config/env-config.module';
import { InventoryModule } from './inventory/inventory.module';
import { SupabaseModule } from './lib/supabase/supabase.module';
import { PaymentTransfersModule } from './payment-transfers/payment-transfers.module';
import { ProductsModule } from './products/products.module';
import { ReportsModule } from './reports/reports.module';
import { SalesModule } from './sales/sales.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    ConfigModule.forRoot({
      validate: (config: Record<string, unknown>) => {
        const result = envSchema.safeParse(config);

        if (!result.success) {
          throw new Error(
            `Config validation error: ${result.error.toString()}`
          );
        }

        return result.data as EnvironmentVariables;
      },
      validationOptions: {
        allowUnknown: false,
        abortEarly: true,
      },
      isGlobal: true,
    }),
    EnvConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SupabaseModule,
    AuthModule,
    BranchesModule,
    CustomersModule,
    CategoriesModule,
    ProductsModule,
    InventoryModule,
    SalesModule,
    PaymentTransfersModule,
    ReportsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy, LoginAttemptsService],
})
export class AppModule {}
