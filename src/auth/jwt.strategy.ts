import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport';
import { ExtractJwt } from 'passport-jwt';

import { SupabaseService } from '../lib/supabase/supabase.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly supabaseService: SupabaseService) {
    super();
  }

  async authenticate(req: any): Promise<void> {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (!token) {
      return this.fail('No bearer token provided', 401);
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .auth.getUser(token);

    if (error || !data.user) {
      return this.fail(error?.message || 'Unauthorized', error?.status || 401);
    }

    return this.success({
      id: data.user.id,
      email: data.user.email,
      ...data.user,
    });
  }

  validate(..._args: any[]): any {
    return null;
  }
}
