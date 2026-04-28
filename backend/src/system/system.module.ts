import { Module } from '@nestjs/common';
import { SeedModule } from '../seed/seed.module';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';

@Module({
  imports: [SeedModule],
  controllers: [SystemController],
  providers: [SystemService],
})
export class SystemModule {}
