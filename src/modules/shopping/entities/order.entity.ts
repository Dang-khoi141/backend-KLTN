import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Users } from '../../user/entities/users.entity';
import { Promotion } from '../../promotion/entities/promotion.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
}

@Entity({ name: 'orders', synchronize: false })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'order_number' })
  orderNumber: string;

  @ManyToOne(() => Users, { onDelete: 'RESTRICT', eager: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: Users;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'payment_method',
    default: 'COD',
  })
  paymentMethod: string;

  @Column({ type: 'text', name: 'shipping_address', nullable: true })
  shippingAddress: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true, name: 'payos_order_code' })
  payosOrderCode?: number;

  @ManyToOne(() => Promotion, { nullable: true })
  @JoinColumn({ name: 'promotion_id' })
  promotion?: Promotion;

  @Column({ type: 'decimal', precision: 10, scale: 0, nullable: true })
  discountAmount?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
