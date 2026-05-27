import {
  Entity, PrimaryGeneratedColumn, OneToOne, OneToMany,
  JoinColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.cart)
  @JoinColumn()
  user: User;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true, eager: true })
  items: CartItem[];

  @UpdateDateColumn()
  updatedAt: Date;
}
