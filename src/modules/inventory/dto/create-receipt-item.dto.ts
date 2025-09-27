import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

export class CreateReceiptItemDto {
  @ApiProperty({ type: 'string', format: 'uuid', example: 'uuid-product' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 10, minimum: 1, description: 'Số lượng nhập' })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 15000, minimum: 0, description: 'Đơn giá nhập' })
  @Min(0)
  unitCost: number;
}
