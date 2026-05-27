import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany,
} from 'typeorm';
import { Category } from '../categories/category.entity';
import { CartItem } from '../cart/cart-item.entity';
import { OrderItem } from '../orders/order-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  oldPrice: number;

  @Column({ nullable: true })
  badge: string;

  @Column({ nullable: true })
  badgeType: string;

  @Column('simple-array')
  sizes: string[];

  @Column('simple-array')
  colors: string[];

  @Column({ nullable: true })
  image: string;

  @Column({ default: false })
  featured: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  category: Category;

  @OneToMany(() => CartItem, (item) => item.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];
}
