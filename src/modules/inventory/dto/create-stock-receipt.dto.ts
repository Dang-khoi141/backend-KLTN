import {
  IsUUID,
  IsInt,
  IsDateString,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class StockReceiptDetailDto {
  @IsUUID()
  productId: string;

  @IsInt()
  quantity: number;

  @IsNumber()
  unitCost: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: Date;
}

export class CreateStockReceiptDto {
  @IsInt()
  warehouseId: number;

  @IsUUID()
  brandId: string;

  @IsDateString()
  receiptDate: Date;

  @IsNumber()
  totalValue: number;

  @IsUUID()
  receivedBy: string;

  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockReceiptDetailDto)
  details: StockReceiptDetailDto[];
}
