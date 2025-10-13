import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { StockReceipt } from './stock-receipt.entity';
import { Product } from '../../catalog/entities/product.entity';

@Entity({ name: 'stockreceiptdetails', synchronize: true })
export class StockReceiptDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StockReceipt, (r) => r.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receipt_id' })
  receipt: StockReceipt;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int' }) quantity: number;
  @Column({ type: 'decimal', precision: 12, scale: 2 }) unitCost: number;
}
