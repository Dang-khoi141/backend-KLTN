import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InventoryCheck } from './inventory-check.entity';

@Entity({ name: 'inventorycheckdetails', synchronize: false })
export class InventoryCheckDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('uuid')
  productId: string;

  @Column('int')
  systemQuantity: number;

  @Column('int')
  actualQuantity: number;

  @Column('int', { nullable: true })
  variance: number;

  @Column('text', { nullable: true })
  notes: string;

  @ManyToOne(() => InventoryCheck, (check) => check.details)
  @JoinColumn({ name: 'check_id' })
  check: InventoryCheck;
}
