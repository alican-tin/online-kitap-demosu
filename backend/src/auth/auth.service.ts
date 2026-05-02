import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('E-posta ve sifre gereklidir.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Giris basarisiz.');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Giris basarisiz.');
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const payload = {
      sub: authUser.id,
      email: authUser.email,
      name: authUser.name,
      role: authUser.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return { user: authUser, token };
  }

  async register(name: string, email: string, password: string) {
    if (!name || !email || !password) {
      throw new BadRequestException('Isim, e-posta ve sifre gereklidir.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new BadRequestException('Bu e-posta zaten kullaniliyor.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: UserRole.CUSTOMER,
      },
    });

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const payload = {
      sub: authUser.id,
      email: authUser.email,
      name: authUser.name,
      role: authUser.role,
    };

    const token = await this.jwtService.signAsync(payload);

    return { user: authUser, token };
  }
}
