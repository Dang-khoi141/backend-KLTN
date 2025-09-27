import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min } from 'class-validator';

export class CreateIssueItemDto {
  @ApiProperty({ type: 'string', format: 'uuid', example: 'uuid-product' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 5, minimum: 1, description: 'Số lượng xuất' })
  @IsInt()
  @Min(1)
  quantity: number;
}
