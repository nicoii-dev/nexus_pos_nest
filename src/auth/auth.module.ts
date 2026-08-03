import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';

import { EnvConfigModule } from '../env-config/env-config.module';
import { SupabaseModule } from '../lib/supabase/supabase.module';

import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { LoginAttemptsService } from './login-attempts.service';

@Module({
  imports: [
    EnvConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    SupabaseModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    JwtStrategy,
    AuthRepository,
    LoginAttemptsService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
