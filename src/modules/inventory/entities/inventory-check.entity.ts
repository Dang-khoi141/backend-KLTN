import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { InventoryCheckDetail } from './inventory-check-detail.entity';

@Entity({ name: 'inventorychecks', synchronize: false })
export class InventoryCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'timestamp' }) checkDate: Date;
  @Column({ type: 'uuid' }) checkedBy: string;

  @OneToMany(() => InventoryCheckDetail, (d) => d.check, { cascade: true })
  details: InventoryCheckDetail[];
}
