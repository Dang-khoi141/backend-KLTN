import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'warehouses', synchronize: true })
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() name: string;
  @Column({ nullable: true }) address?: string;
}
