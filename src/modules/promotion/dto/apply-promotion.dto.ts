import { IsString, IsNumber } from 'class-validator';

export class ApplyPromotionDto {
  @IsString()
  code: string;

  @IsNumber()
  total: number;
}
