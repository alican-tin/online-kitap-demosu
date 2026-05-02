import { Injectable, Logger } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { SeedService } from '../seed/seed.service';

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);
  private readonly junkPasswordHash = bcrypt.hashSync('123456', 10);

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
    const stamp = Date.now().toString(36);
    const junkUsers = Array.from({ length: 3 }, (_, index) => {
      const token = `${stamp}-${index + 1}-${this.randomWord(4)}`;

      return {
        name: `${this.randomWord(6)} ${this.randomWord(8)}`,
        email: `bozuk.${token}@demo.local`,
        passwordHash: this.junkPasswordHash,
        role: UserRole.CUSTOMER,
      };
    });

    const junkBooks = Array.from({ length: 5 }, () => ({
      title: this.randomWord(7),
      author: `${this.randomWord(6)} ${this.randomWord(8)}`,
      imagePath: `/images/bozuk-${this.randomWord(6)}.jpg`,
      price: 999999,
    }));

    await this.prisma.user.createMany({ data: junkUsers });
    await this.prisma.book.createMany({ data: junkBooks });

    return junkBooks.length + junkUsers.length;
  }

  private randomWord(length: number): string {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  }
}
