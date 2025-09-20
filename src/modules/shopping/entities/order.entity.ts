import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Users } from '../../user/entities/users.entity';

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELED';

@Entity({ name: 'orders', synchronize: true })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, { onDelete: 'RESTRICT', eager: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Users;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
