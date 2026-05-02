import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SystemService } from './system.service';

@Controller('system')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
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
