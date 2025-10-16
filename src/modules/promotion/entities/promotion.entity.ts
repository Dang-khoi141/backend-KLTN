import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'promotions', synchronize: false })
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercent?: number;

  @Column({ type: 'decimal', precision: 10, scale: 0, nullable: true })
  discountAmount?: number;

  @Column({ type: 'decimal', precision: 10, scale: 0, nullable: true })
  minOrderValue?: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
