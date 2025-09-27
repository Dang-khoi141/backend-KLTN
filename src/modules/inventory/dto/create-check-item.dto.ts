import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt } from 'class-validator';

export class CreateCheckItemDto {
  @ApiProperty({ type: 'string', format: 'uuid', example: 'uuid-product' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 50, description: 'Số lượng hệ thống đang có' })
  @IsInt()
  systemQuantity: number;

  @ApiProperty({ example: 48, description: 'Số lượng thực tế kiểm kê' })
  @IsInt()
  actualQuantity: number;
}
