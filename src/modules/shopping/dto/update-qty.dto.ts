import { IsUUID, IsInt, Min } from 'class-validator';

export class UpdateQtyDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  productId: string;

  @IsInt()
  @Min(0)
  quantity: number;
}
