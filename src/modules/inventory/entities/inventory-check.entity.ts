import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { InventoryCheckDetail } from './inventory-checkdetail.entity';

@Entity({ name: 'inventorychecks', synchronize: false })
export class InventoryCheck {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  warehouseId: number;

  @Column({ type: 'timestamp' })
  checkDate: Date;

  @Column('uuid')
  checkedBy: string;

  @Column('text', { nullable: true })
  notes: string;

  @OneToMany(() => InventoryCheckDetail, (detail) => detail.check, {
    cascade: true,
  })
  details: InventoryCheckDetail[];
}
