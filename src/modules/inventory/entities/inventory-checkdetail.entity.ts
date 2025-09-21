import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InventoryCheck } from './inventory-check.entity';

@Entity('inventorycheckdetails')
export class InventoryCheckDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  checkId: number; // FK -> inventorychecks.id

  @Column('uuid')
  productId: string; // FK -> products.id

  @Column('int')
  systemQuantity: number;

  @Column('int')
  actualQuantity: number;

  @Column('int', { nullable: true })
  variance: number;

  @Column('text', { nullable: true })
  notes: string;

  @ManyToOne(() => InventoryCheck, (check) => check.details)
  @JoinColumn({ name: 'checkId' })
  check: InventoryCheck;
}
