import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.postsService.create(body, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reply')
  reply(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.postsService.reply(id, body, req.user.id);
  }
}
