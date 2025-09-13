import { PartialType } from '@nestjs/swagger';
import { CreateShoppingDto } from './create-shopping.dto';

export class UpdateShoppingDto extends PartialType(CreateShoppingDto) {}
