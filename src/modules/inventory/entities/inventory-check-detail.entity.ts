import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { InventoryCheck } from './inventory-check.entity';
import { Product } from '../../catalog/entities/product.entity';

@Entity({ name: 'inventorycheckdetails', synchronize: false })
export class InventoryCheckDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => InventoryCheck, (c) => c.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'check_id' })
  check: InventoryCheck;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int' }) systemQuantity: number;
  @Column({ type: 'int' }) actualQuantity: number;
  @Column({ type: 'int' }) variance: number;
}
