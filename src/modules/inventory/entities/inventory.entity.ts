import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Product } from '../../catalog/entities/product.entity';

@Entity({ name: 'inventory', synchronize: false })
export class Inventory {
  @PrimaryColumn('uuid', { name: 'product_id' })
  productId: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 10, name: 'low_stock_threshold' })
  lowStockThreshold: number;

  @OneToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
