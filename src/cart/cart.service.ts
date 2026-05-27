import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { ProductsService } from '../products/products.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { User } from '../users/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private readonly itemRepo: Repository<CartItem>,
    private readonly productsService: ProductsService,
  ) {}

  async getOrCreateCart(user: User): Promise<Cart> {
    let cart = await this.cartRepo.findOne({
      where: { user: { id: user.id } },
      relations: { items: { product: { category: true } } },
    });
    if (!cart) {
      cart = this.cartRepo.create({ user });
      await this.cartRepo.save(cart);
    }
    return this.withTotal(cart);
  }

  async addItem(user: User, dto: AddToCartDto) {
    const cart = await this.getOrCreateCart(user);
    const product = await this.productsService.findOne(dto.productId);

    const existing = cart.items?.find(
      (i) =>
        i.product.id === product.id &&
        i.selectedSize === dto.selectedSize &&
        i.selectedColor === dto.selectedColor,
    );

    if (existing) {
      existing.quantity += dto.quantity ?? 1;
      await this.itemRepo.save(existing);
    } else {
      const item = this.itemRepo.create({
        cart,
        product,
        quantity: dto.quantity ?? 1,
        selectedSize: dto.selectedSize,
        selectedColor: dto.selectedColor,
      });
      await this.itemRepo.save(item);
    }

    return this.getOrCreateCart(user);
  }

  async updateItem(user: User, itemId: number, quantity: number) {
    const cart = await this.getOrCreateCart(user);
    const item = cart.items?.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Item no encontrado en el carrito');

    if (quantity <= 0) {
      await this.itemRepo.remove(item);
    } else {
      item.quantity = quantity;
      await this.itemRepo.save(item);
    }

    return this.getOrCreateCart(user);
  }

  async removeItem(user: User, itemId: number) {
    const cart = await this.getOrCreateCart(user);
    const item = cart.items?.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Item no encontrado en el carrito');
    await this.itemRepo.remove(item);
    return this.getOrCreateCart(user);
  }

  async clearCart(user: User) {
    const cart = await this.getOrCreateCart(user);
    if (cart.items?.length) await this.itemRepo.remove(cart.items);
    return this.getOrCreateCart(user);
  }

  private withTotal(cart: Cart) {
    const total = cart.items?.reduce(
      (sum, item) => sum + Number(item.product?.price ?? 0) * item.quantity,
      0,
    ) ?? 0;
    return { ...cart, total };
  }
}
