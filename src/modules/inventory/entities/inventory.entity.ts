import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('inventory')
export class Inventory {
  @PrimaryColumn('uuid')
  productId: string;

  @Column('int')
  stock: number;

  @Column('int', { nullable: true })
  lowStockThreshold: number;
}
