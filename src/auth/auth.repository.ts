import { Injectable } from '@nestjs/common';

import { SupabaseService } from '../lib/supabase/supabase.service';
import { SignupDto } from './dto/auth.dto';

@Injectable()
export class AuthRepository {
  constructor(private readonly supabaseService: SupabaseService) {}

  async supabaseSignIn(email: string, password: string) {
    return await this.supabaseService.createAnonClient().auth.signInWithPassword({
      email,
      password,
    });
  }

  async supabaseSignUp(signupDto: SignupDto) {
    return await this.supabaseService.createAnonClient().auth.signUp({
      email: signupDto.email,
      password: signupDto.password,
      options: {
        data: {
          name: signupDto.name,
          role: signupDto.role,
        },
      },
    });
  }

  async supabaseGetUser(userId: string) {
    return await this.supabaseService
      .getClient()
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  }

  async supabaseLogout() {
    return await this.supabaseService.createAnonClient().auth.signOut();
  }

  async supabaseGetAuthenticatedUser(accessToken: string) {
    return await this.supabaseService.createAnonClient().auth.getUser(accessToken);
  }
}
