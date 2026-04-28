import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { runSeed } from './seed-runner';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async runSeed(): Promise<void> {
    this.logger.log('Seeding database...');
    await runSeed(this.prisma);
    this.logger.log('Database seeded.');
  }
}
