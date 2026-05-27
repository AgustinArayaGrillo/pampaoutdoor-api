import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../products/product.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  cart: Cart;

  @ManyToOne(() => Product, (product) => product.cartItems, { eager: true })
  product: Product;

  @Column({ default: 1 })
  quantity: number;

  @Column({ nullable: true })
  selectedSize: string;

  @Column({ nullable: true })
  selectedColor: string;
}
