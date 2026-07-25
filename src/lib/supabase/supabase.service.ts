import { Injectable, Logger } from '@nestjs/common';

import { SupabaseClient, createClient } from '@supabase/supabase-js';

import { EnvConfigService } from '../../env-config/env-config.service';

@Injectable()
export class SupabaseService {
  private readonly supabaseServiceLogger = new Logger(
    `💼 ${SupabaseService.name}`
  );
  private readonly supabase: SupabaseClient;

  constructor(private readonly envConfigService: EnvConfigService) {
    if (
      !this.envConfigService.getSupabaseUrl() ||
      !this.envConfigService.getSupabaseAnonKey() ||
      !this.envConfigService.getSupabaseRoleKey()
    ) {
      this.supabaseServiceLogger.error('Supabase URL and Key must be provided');
      throw new Error('Supabase URL and Key must be provided');
    }

    this.supabase = createClient(
      this.envConfigService.getSupabaseUrl(),
      this.envConfigService.getSupabaseRoleKey()
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
