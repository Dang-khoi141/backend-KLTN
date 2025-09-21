import {
  IsUUID,
  IsInt,
  IsDateString,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class InventoryCheckDetailDto {
  @IsUUID()
  productId: string;

  @IsInt()
  systemQuantity: number;

  @IsInt()
  actualQuantity: number;

  @IsOptional()
  notes?: string;
}

export class CreateInventoryCheckDto {
  @IsInt()
  warehouseId: number;

  @IsDateString()
  checkDate: Date;

  @IsUUID()
  checkedBy: string;

  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryCheckDetailDto)
  details: InventoryCheckDetailDto[];
}
