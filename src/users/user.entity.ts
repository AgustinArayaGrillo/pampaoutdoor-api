import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  OneToMany, OneToOne,
} from 'typeorm';
import { Order } from '../orders/order.entity';
import { Cart } from '../cart/cart.entity';

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;
}
