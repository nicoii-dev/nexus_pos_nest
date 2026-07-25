import { Injectable } from '@nestjs/common';

@Injectable()
export class LoginAttemptsService {
  private attempts = new Map<string, number>();

  registerFailure(identifier: string): number {
    const current = this.attempts.get(identifier) || 0;
    const next = current + 1;
    this.attempts.set(identifier, next);
    return next;
  }

  reset(identifier: string) {
    this.attempts.delete(identifier);
  }
}
