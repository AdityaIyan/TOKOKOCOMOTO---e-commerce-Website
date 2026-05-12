import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async createOrder(buyerId: string, data: any) {
    // Expected data: { items: [{ productId, quantity }] }
    let totalAmount = 0;
    const orderItemsData: any[] = [];
    let itemsToProcess = data.items;

    // If no items provided, checkout from cart
    if (!itemsToProcess || itemsToProcess.length === 0) {
      const cart = await this.prisma.cart.findUnique({
        where: { userId: buyerId },
        include: { items: { include: { product: true } } }
      });
      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }
      itemsToProcess = cart.items.map(ci => ({
        productId: ci.productId,
        quantity: ci.quantity
      }));
    }

    for (const item of itemsToProcess) {
      const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.quantity) {
        throw new BadRequestException(`Product ${product?.name || item.productId} is out of stock`);
      }
      
      const price = product.price;
      totalAmount += price * item.quantity;
      
      orderItemsData.push({
        productId: product.id,
        price: price,
        quantity: item.quantity,
      });

      // Deduct stock
      await this.prisma.product.update({
        where: { id: product.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // Clear cart if we checked out from cart
    if (!data.items || data.items.length === 0) {
      const cart = await this.prisma.cart.findUnique({ where: { userId: buyerId } });
      if (cart) {
        await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    const order = await this.prisma.order.create({
      data: {
        buyerId,
        totalAmount,
        status: 'UNPAID',
        shippingAddress: data.shippingAddress,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: { include: { product: true } },
        buyer: true,
      },
    });

    return order;
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: { items: { include: { product: true } }, buyer: { select: { username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMyOrders(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, buyer: { select: { username: true, email: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: string) {
    const validStatuses = ['UNPAID', 'VERIFYING', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: { buyer: true },
    });

    // Send email notification
    await this.mailService.sendOrderStatusEmail(order.buyer.email, order.id, status);

    return order;
  }

  async payOrder(id: string, buyerId: string, paymentMethod: string, paymentProof: string | null) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== buyerId) throw new BadRequestException('Not your order');
    if (order.status !== 'UNPAID') throw new BadRequestException('Order is not in UNPAID status');
    if (!paymentProof) throw new BadRequestException('Payment proof is required');

    return this.prisma.order.update({
      where: { id },
      data: {
        paymentMethod,
        paymentProof,
        status: 'VERIFYING',
      },
    });
  }
}
