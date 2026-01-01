import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string, lang = 'en', skip = 0, take = 20) {
    const limit = Math.min(take, 100);
    return this.prisma.category.findMany({
      where: {
        OR: [{ isGlobal: true }, { organizationId }],
      },
      distinct: ['slug'],
      orderBy: [{ isGlobal: 'asc' }, { slug: 'asc' }],
      skip,
      take: limit,
      select: {
        id: true,
        slug: true,
        translations: {
          where: { locale: lang },
          select: { name: true },
        },
      },
    });
  }
}
