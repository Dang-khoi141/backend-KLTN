import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { StockReceiptDetail } from './stock-receipt-detail.entity';

@Entity({ name: 'stockreceipts', synchronize: true })
export class StockReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'timestamp' }) receiptDate: Date;
  @Column({ type: 'uuid' }) receivedBy: string;
  @Column({ type: 'decimal', precision: 14, scale: 2 }) totalValue: number;

  @OneToMany(() => StockReceiptDetail, (d) => d.receipt, { cascade: true })
  details: StockReceiptDetail[];
}
