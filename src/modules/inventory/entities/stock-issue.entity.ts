import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { StockIssueDetail } from './stock-issue-detail.entity';

@Entity({ name: 'stockissues', synchronize: true })
export class StockIssue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'uuid', nullable: true }) orderId?: string;
  @Column({ type: 'timestamp' }) issueDate: Date;
  @Column({ type: 'uuid' }) issuedBy: string;

  @OneToMany(() => StockIssueDetail, (d) => d.issue, { cascade: true })
  details: StockIssueDetail[];
}
