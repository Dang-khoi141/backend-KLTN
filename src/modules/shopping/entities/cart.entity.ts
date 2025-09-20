import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CartItem } from './cart-item.entity';
import { Users } from '../../user/entities/users.entity';

@Entity({ name: 'carts', synchronize: true })
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, { onDelete: 'RESTRICT', eager: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Users;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
