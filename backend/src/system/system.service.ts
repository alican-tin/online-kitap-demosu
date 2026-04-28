import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SeedService } from '../seed/seed.service';

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly seedService: SeedService,
  ) {}

  resetInBackground(): void {
    this.seedService
      .runSeed()
      .then(() => this.logger.log('Reset completed.'))
      .catch((error) => this.logger.error('Reset failed.', error));
  }

  async corruptDatabase(): Promise<number> {
    const junkBooks = Array.from({ length: 5 }, () => ({
      title: this.randomWord(7),
      author: `${this.randomWord(6)} ${this.randomWord(8)}`,
      imagePath: `/images/bozuk-${this.randomWord(6)}.jpg`,
      price: 999999,
    }));

    await this.prisma.book.createMany({ data: junkBooks });

    return junkBooks.length;
  }

  private randomWord(length: number): string {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  }
}
