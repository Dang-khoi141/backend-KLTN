import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  expression: `
    SELECT 
      p.id as "product_id",
      p.name as "product_name",
      b.name as "brand_name",
      c.name as "category_name",
      i.stock as "stock",
      i.low_stock_threshold as "low_stock_threshold"
    FROM products p
    JOIN inventory i ON i.product_id = p.id
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
  `,
})
export class InventoryReportEntity {
  @ViewColumn({ name: 'product_id' })
  productId: string;

  @ViewColumn({ name: 'product_name' })
  productName: string;

  @ViewColumn({ name: 'brand_name' })
  brandName: string;

  @ViewColumn({ name: 'category_name' })
  categoryName: string;

  @ViewColumn({ name: 'stock' })
  stock: number;

  @ViewColumn({ name: 'low_stock_threshold' })
  lowStockThreshold: number;
}
