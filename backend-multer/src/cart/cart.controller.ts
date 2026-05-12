import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Post()
  addToCart(@Req() req: any, @Body() body: any) {
    return this.cartService.addToCart(req.user.id, body.productId, body.quantity);
  }

  @Patch(':id')
  updateItem(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.cartService.updateItem(id, quantity);
  }

  @Delete(':id')
  removeItem(@Param('id') id: string) {
    return this.cartService.removeItem(id);
  }
}
