import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, Delete } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BooksService } from './books.service';

type CreateBookDto = {
  title: string;
  author: string;
  imagePath: string;
  price: number;
};

type UpdateBookDto = {
  title?: string;
  author?: string;
  imagePath?: string;
  price?: number;
};

@Controller('books')
@UseGuards(JwtAuthGuard)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '5',
    @Query('search') search = '',
  ) {
    const parsedPage = Number(page);
    const parsedPageSize = Number(pageSize);

    return this.booksService.list({
      page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
      pageSize:
        Number.isFinite(parsedPageSize) && parsedPageSize > 0
          ? Math.min(parsedPageSize, 20)
          : 5,
      search: search?.trim() ?? '',
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() body: CreateBookDto) {
    return this.booksService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() body: UpdateBookDto) {
    return this.booksService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}
