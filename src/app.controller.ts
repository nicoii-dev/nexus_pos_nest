import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('check-health')
  getHello(): string {
    return this.appService.checkHealth();
  }
}
