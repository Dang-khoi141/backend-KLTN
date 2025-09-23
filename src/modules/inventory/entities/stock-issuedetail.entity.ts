import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StockIssue } from './stock-issue.entity';

@Entity({ name: 'stockissuedetails', synchronize: false })
export class StockIssueDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'issue_id', type: 'int' })
  issueId: number;

  @Column('uuid')
  productId: string;

  @Column('int')
  quantity: number;

  @ManyToOne(() => StockIssue, (issue) => issue.details)
  @JoinColumn({ name: 'issue_id' })
  issue: StockIssue;
}
