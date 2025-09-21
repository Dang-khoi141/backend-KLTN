import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StockIssue } from './stock-issue.entity';

@Entity('stockissuedetails')
export class StockIssueDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  issueId: number;

  @Column('uuid')
  productId: string;

  @Column('int')
  quantity: number;

  @ManyToOne(() => StockIssue, (issue) => issue.details)
  @JoinColumn({ name: 'issueId' })
  issue: StockIssue;
}
