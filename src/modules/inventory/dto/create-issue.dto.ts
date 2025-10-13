import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateIssueItemDto } from './create-issue-item.dto';

export class CreateIssueDto {
  @ApiProperty({ type: 'string', format: 'uuid', example: 'uuid-warehouse' })
  @IsUUID()
  warehouseId: string;

  @ApiProperty({ type: 'string', format: 'uuid', example: 'uuid-order' })
  @IsUUID()
  orderId: string;

  @ApiProperty({
    type: [CreateIssueItemDto],
    description: 'Danh sách sản phẩm xuất kho',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIssueItemDto)
  items: CreateIssueItemDto[];
}
