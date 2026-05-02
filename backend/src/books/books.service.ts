import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type BookListParams = {
  page: number;
  pageSize: number;
  search?: string;
};

type CreateBookInput = {
  title: string;
  author: string;
  imagePath: string;
  price: number;
};

type UpdateBookInput = {
  title?: string;
  author?: string;
  imagePath?: string;
  price?: number;
};

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async list({ page, pageSize, search }: BookListParams) {
    const skip = (page - 1) * pageSize;
    const term = search?.trim();

    const where = term
      ? {
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { author: { contains: term, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { title: 'asc' },
        select: {
          id: true,
          title: true,
          author: true,
          price: true,
          imagePath: true,
        },
      }),
      this.prisma.book.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return {
      items,
      page,
      pageSize,
      total,
      totalPages,
    };
  }

  async create(input: CreateBookInput) {
    const title = input.title?.trim();
    const author = input.author?.trim();
    const imagePath = input.imagePath?.trim();
    const price = Math.round(Number(input.price));

    if (!title || !author || !imagePath || !Number.isFinite(price) || price <= 0) {
      throw new BadRequestException('Gecerli kitap bilgileri gereklidir.');
    }

    return this.prisma.book.create({
      data: {
        title,
        author,
        imagePath,
        price,
      },
    });
  }

  async update(id: string, input: UpdateBookInput) {
    const data: UpdateBookInput = {};

    if (typeof input.title === 'string') {
      data.title = input.title.trim();
    }

    if (typeof input.author === 'string') {
      data.author = input.author.trim();
    }

    if (typeof input.imagePath === 'string') {
      data.imagePath = input.imagePath.trim();
    }

    if (input.price !== undefined) {
      const price = Math.round(Number(input.price));
      if (!Number.isFinite(price) || price <= 0) {
        throw new BadRequestException('Fiyat gecersiz.');
      }
      data.price = price;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Guncellenecek alan bulunamadi.');
    }

    try {
      return await this.prisma.book.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException('Kitap bulunamadi.');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.book.delete({ where: { id } });
      return { ok: true };
    } catch (err) {
      throw new NotFoundException('Kitap bulunamadi.');
    }
  }
}
