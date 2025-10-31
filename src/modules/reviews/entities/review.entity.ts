import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from '../../user/entities/users.entity';
import { Product } from '../../catalog/entities/product.entity';

@Entity({ name: 'reviews', synchronize: false })
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', width: 1 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @Column({ name: 'is_verified_purchase', type: 'boolean', default: false })
  isVerifiedPurchase: boolean;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
