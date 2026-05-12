import { Controller, Get, Post, Body, Put, Param, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.ordersService.createOrder(req.user.id, body);
  }

  @Get()
  async findAll(@Req() req: any) {
    // Determine if the user is an admin/seller or buyer
    let orders;
    if (req.user.role === 'ADMIN' || req.user.role === 'SELLER') {
      orders = await this.ordersService.findAll();
    } else {
      orders = await this.ordersService.findMyOrders(req.user.id);
    }
    
    // The frontend expects { data: Order[], totalPages: number }
    return {
      data: orders,
      totalPages: 1
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id/status')
  @Roles('ADMIN', 'SELLER')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  @Post(':id/pay')
  @UseInterceptors(FileInterceptor('proof'))
  payOrder(
    @Param('id') id: string,
    @Body('paymentMethod') paymentMethod: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any
  ) {
    let proofFilename: string | null = null;
    if (file) {
      proofFilename = file.filename;
    }
    return this.ordersService.payOrder(id, req.user.id, paymentMethod, proofFilename);
  }
}
