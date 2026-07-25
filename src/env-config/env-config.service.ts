import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { EnvironmentVariables } from './env-config';

@Injectable()
export class EnvConfigService {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>
  ) {}

  getNodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', { infer: true })!;
  }

  getPort(): number {
    return this.configService.get<number>('PORT', { infer: true })!;
  }

  getSupabaseJwtSecret(): string {
    return this.configService.get<string>('SUPABASE_JWT_SECRET', {
      infer: true,
    })!;
  }

  getSupabaseUrl(): string {
    return this.configService.get<string>('SUPABASE_URL', {
      infer: true,
    })!;
  }

  getSupabaseAnonKey(): string {
    return this.configService.get<string>('SUPABASE_ANON_KEY', {
      infer: true,
    })!;
  }

  getSupabaseRoleKey(): string {
    return this.configService.get<string>('SUPABASE_ROLE_KEY', {
      infer: true,
    })!;
  }

  getClientUrl(): string {
    return this.configService.get<string>('CLIENT_URL', {
      infer: true,
    })!;
  }
}
