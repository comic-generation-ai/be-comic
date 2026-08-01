import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './module/auth/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * [story-be-production-hardening] Changed: health/hello route marked @Public for global JwtAuthGuard.
   */
  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
