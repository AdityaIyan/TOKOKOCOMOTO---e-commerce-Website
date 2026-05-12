import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      include: { seller: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { seller: { select: { username: true } } },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(data: any, username: string) {
    return this.prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
        sku: data.sku,
        category: data.category,
        images: data.images, // Array of strings or single string
        seller: { connect: { username } },
      },
    });
  }

  async update(id: string, data: any, username: string, role: string) {
    const product = await this.findOne(id);
    if (product.seller.username !== username && role !== 'ADMIN') {
      throw new UnauthorizedException('You can only update your own products');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        price: data.price ? Number(data.price) : undefined,
        stock: data.stock ? Number(data.stock) : undefined,
        sku: data.sku,
        category: data.category,
        ...(data.images && { images: data.images }),
      },
    });
  }

  async remove(id: string, username: string, role: string) {
    const product = await this.findOne(id);
    if (product.seller.username !== username && role !== 'ADMIN') {
      throw new UnauthorizedException('You can only delete your own products');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
