import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateReceiptItemDto } from './create-receipt-item.dto';

export class CreateReceiptDto {
  @ApiProperty({ type: 'string', format: 'uuid', example: 'uuid-warehouse' })
  @IsUUID()
  warehouseId: string;

  @ApiProperty({
    type: [CreateReceiptItemDto],
    description: 'Danh sách sản phẩm nhập kho',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReceiptItemDto)
  items: CreateReceiptItemDto[];
}
