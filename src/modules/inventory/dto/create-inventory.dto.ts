import { IsUUID, IsInt, IsOptional } from 'class-validator';

export class CreateInventoryDto {
  @IsUUID()
  productId: string;

  @IsInt()
  stock: number;

  @IsOptional()
  @IsInt()
  lowStockThreshold?: number;
}
