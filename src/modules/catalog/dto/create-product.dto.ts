import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    example: 'Banana',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    type: 'number',
    format: 'float',
    example: 50000.0,
    minimum: 0,
  })
  @Type(() => Number) // swagger prob
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiProperty({
    example: 'A high-quality product',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageUrl: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'Upload image file (optional)',
  })
  imageFile?: any;

  @ApiProperty({
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true) //swagger prob
  isActive?: boolean;

  @ApiProperty({
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  brandId?: string;
}
