import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { SupabaseService } from '../lib/supabase/supabase.service';
import { AuthRepository } from './auth.repository';
import { SignupDto } from './dto/auth.dto';
import { LoginAttemptsService } from './login-attempts.service';

@Injectable()
export class AuthService {
  private readonly authServiceLogger = new Logger(`🔒 ${AuthService.name}`);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly supabaseService: SupabaseService,
    private readonly loginAttemptsService: LoginAttemptsService
  ) {}

  async signup(signupDto: SignupDto) {
    const { data, error } = await this.authRepository.supabaseSignUp(signupDto);

    if (error) {
      this.authServiceLogger.error('Supabase SIGN UP Error: ', error);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST
      );
    }

    if (data.user) {
      const { error: profileError } = await this.supabaseService
        .getClient()
        .from('profiles')
        .insert({
          id: data.user.id,
          name: signupDto.name,
          email: signupDto.email,
          role: signupDto.role,
        });

      if (profileError) {
        this.authServiceLogger.error('Profile creation error:', profileError);
      }
    }

    return data;
  }

  async logout() {
    const { error } = await this.authRepository.supabaseLogout();
    if (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST
      );
    }
    return { message: 'User logged out successfully' };
  }

  async getProfile(userId: string) {
    const { data, error } = await this.authRepository.supabaseGetUser(userId);
    if (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
    return data;
  }
}
