import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { runSeed } from './seed-runner';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);
  private isRunning = false;

  constructor(private readonly prisma: PrismaService) {}

  async runSeed(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Seed already running, skipping.');
      return;
    }

    this.isRunning = true;
    this.logger.log('Seeding database...');

    try {
      await runSeed(this.prisma);
      this.logger.log('Database seeded.');
    } finally {
      this.isRunning = false;
    }
  }
}
