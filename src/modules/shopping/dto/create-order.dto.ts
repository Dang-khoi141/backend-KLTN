import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateOrderDto {
  @IsEnum(['COD', 'ONLINE'])
  @IsOptional()
  paymentMethod?: 'COD' | 'ONLINE';

  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional() 
  @IsString()
  promotionCode?: string;
}
 