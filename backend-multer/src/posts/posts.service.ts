import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.post.findMany({
      where: { parentId: null },
      include: {
        author: { select: { username: true } },
        replies: { include: { author: { select: { username: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { username: true } },
        replies: { include: { author: { select: { username: true } } } },
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async create(data: any, authorId: string) {
    return this.prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        authorId,
      },
    });
  }

  async reply(parentId: string, data: any, authorId: string) {
    const parent = await this.prisma.post.findUnique({ where: { id: parentId } });
    if (!parent) throw new NotFoundException('Parent post not found');

    return this.prisma.post.create({
      data: {
        content: data.content,
        authorId,
        parentId,
      },
    });
  }
}
