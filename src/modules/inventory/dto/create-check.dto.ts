import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested, IsArray, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCheckItemDto } from './create-check-item.dto';

export class CreateCheckDto {
  @ApiProperty({ type: 'string', format: 'uuid', example: 'uuid-warehouse' })
  @IsUUID()
  warehouseId: string;

  @ApiProperty({
    type: [CreateCheckItemDto],
    description: 'Danh sách sản phẩm kiểm kê',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCheckItemDto)
  items: CreateCheckItemDto[];
}
