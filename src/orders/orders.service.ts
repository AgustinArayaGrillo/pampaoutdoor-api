import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly itemRepo: Repository<OrderItem>,
    private readonly cartService: CartService,
  ) {}

  async createFromCart(user: User, dto: CreateOrderDto) {
    const cart = await this.cartService.getOrCreateCart(user);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('El carrito está vacío');
    }

    const items: OrderItem[] = cart.items.map((ci) => {
      return this.itemRepo.create({
        product: ci.product,
        quantity: ci.quantity,
        unitPrice: ci.product.price,
        selectedSize: ci.selectedSize,
        selectedColor: ci.selectedColor,
      });
    });

    const total = items.reduce(
      (sum, i) => sum + Number(i.unitPrice) * i.quantity,
      0,
    );

    const order = this.orderRepo.create({
      user,
      items,
      total,
      shippingAddress: dto.shippingAddress,
      notes: dto.notes,
    });

    await this.orderRepo.save(order);
    await this.cartService.clearCart(user);
    return order;
  }

  async findMyOrders(user: User) {
    return this.orderRepo.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number, user: User) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Orden no encontrada');
    if (order.user.id !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('No tenés acceso a esta orden');
    }
    return order;
  }

  async updateStatus(id: number, status: OrderStatus) {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Orden no encontrada');
    order.status = status;
    return this.orderRepo.save(order);
  }

  async findAll() {
    return this.orderRepo.find({ order: { createdAt: 'DESC' } });
  }
}
