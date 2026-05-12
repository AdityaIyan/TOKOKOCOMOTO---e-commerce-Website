import { Controller, Get, Post, Body, Put, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, UploadedFiles } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SELLER')
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() body: any, @Req() req: any, @UploadedFile() file: Express.Multer.File) {
    // If a file is uploaded, set the images field to the filename
    const data = { ...body };
    if (file) {
      // The frontend expects array or string. Let's provide stringified array or just single string based on what frontend sends
      // If frontend uses `images[0]`, it's an array
      data.images = JSON.stringify([file.filename]);
    } else if (data.image) {
      data.images = JSON.stringify([data.image]);
    } else {
      data.images = JSON.stringify(['default.jpg']);
    }

    return this.productsService.create(data, req.user.username);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SELLER')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(@Param('id') id: string, @Body() body: any, @Req() req: any, @UploadedFile() file: Express.Multer.File) {
    const data = { ...body };
    if (file) {
      data.images = JSON.stringify([file.filename]);
    }
    return this.productsService.update(id, data, req.user.username, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SELLER')
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.productsService.remove(id, req.user.username, req.user.role);
  }
}
