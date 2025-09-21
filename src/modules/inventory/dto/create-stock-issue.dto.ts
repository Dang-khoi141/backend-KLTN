import {
  IsUUID,
  IsInt,
  IsDateString,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class StockIssueDetailDto {
  @IsUUID()
  productId: string;

  @IsInt()
  quantity: number;
}

export class CreateStockIssueDto {
  @IsInt()
  warehouseId: number;

  @IsUUID()
  orderId: string;

  @IsDateString()
  issueDate: Date;

  @IsUUID()
  issuedBy: string;

  @IsUUID()
  receivedBy: string;

  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockIssueDetailDto)
  details: StockIssueDetailDto[];
}
