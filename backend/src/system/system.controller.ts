import { Controller, HttpCode, Post } from '@nestjs/common';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Post('reset')
  @HttpCode(202)
  reset() {
    this.systemService.resetInBackground();
    return { status: 'queued' };
  }

  @Post('corrupt')
  async corrupt() {
    const inserted = await this.systemService.corruptDatabase();
    return { inserted };
  }
}
