import { IsOptional, IsInt, IsUUID } from 'class-validator';

export class InventoryReportFilterDto {
  @IsOptional()
  @IsInt()
  warehouseId?: number;

  @IsOptional()
  @IsUUID()
  brandId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class InventoryReportItemDto {
  productId: string;
  productName: string;
  brandName: string;
  categoryName: string;
  stock: number;
  lowStockThreshold: number;
  status: 'OK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}
