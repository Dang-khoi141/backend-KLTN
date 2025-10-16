import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'warehouses', synchronize: false })
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() name: string;
  @Column({ nullable: true }) address?: string;
}
