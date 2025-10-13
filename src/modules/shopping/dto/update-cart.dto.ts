import { IsUUID, IsInt, Min } from 'class-validator';

export class UpdateCartDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(0)
  quantity: number;
}
