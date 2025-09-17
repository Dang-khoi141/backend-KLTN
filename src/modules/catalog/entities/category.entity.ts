import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Product } from './product.entity';

@Entity({ name: 'categorys', synchronize: true })
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
  })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];
}
