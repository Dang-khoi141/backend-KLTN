import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StockReceipt } from './stock-receipt.entity';

@Entity('stockreceiptdetails')
export class StockReceiptDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  productId: string;

  @Column('int')
  quantity: number;

  @Column('numeric')
  unitCost: number;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @ManyToOne(() => StockReceipt, (receipt) => receipt.details)
  @JoinColumn({ name: 'receipt_id' })
  receipt: StockReceipt;
}
