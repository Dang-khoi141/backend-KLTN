import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { StockIssue } from './stock-issue.entity';
import { Product } from '../../catalog/entities/product.entity';

@Entity({ name: 'stockissuedetails', synchronize: true })
export class StockIssueDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StockIssue, (i) => i.details, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'issue_id' })
  issue: StockIssue;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'int' }) quantity: number;
}
