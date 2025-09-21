import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { StockReceiptDetail } from './stock-receiptdetail.entity';
@Entity('stockreceipts')
export class StockReceipt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  warehouseId: number;

  @Column('uuid')
  brandId: string;

  @Column({ type: 'timestamp' })
  receiptDate: Date;

  @Column('numeric')
  totalValue: number;

  @Column('uuid')
  receivedBy: string;

  @Column('text', { nullable: true })
  notes: string;

  @OneToMany(() => StockReceiptDetail, (detail) => detail.receipt, {
    cascade: true,
  })
  details: StockReceiptDetail[];
}
