import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { StockIssueDetail } from './stock-issuedetail.entity';

@Entity('stockissues')
export class StockIssue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  warehouseId: number;

  @Column('uuid')
  orderId: string;

  @Column({ type: 'timestamp' })
  issueDate: Date;

  @Column('uuid')
  issuedBy: string;

  @Column('uuid')
  receivedBy: string;

  @Column('text', { nullable: true })
  notes: string;

  @OneToMany(() => StockIssueDetail, (detail) => detail.issue, {
    cascade: true,
  })
  details: StockIssueDetail[];
}
