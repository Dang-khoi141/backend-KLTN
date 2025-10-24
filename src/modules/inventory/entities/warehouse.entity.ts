import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'warehouses', synchronize: true })
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() name: string;

  @Column({ nullable: true }) address?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
