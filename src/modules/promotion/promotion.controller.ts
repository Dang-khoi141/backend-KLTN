import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';

import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { ApplyPromotionDto } from './dto/apply-promotion.dto';

@Controller('promotions')
export class PromotionController {
  constructor(private readonly promoService: PromotionService) {}

  @Get()
  @ResponseMessage('Promotion list retrieved successfully')
  findAll() {
    return this.promoService.findAll();
  }

  @Get(':id')
  @ResponseMessage('Promotion details retrieved successfully')
  findOne(@Param('id') id: string) {
    return this.promoService.findOne(id);
  }

  @Post()
  @ResponseMessage('Promotion created successfully')
  create(@Body() dto: CreatePromotionDto) {
    return this.promoService.create(dto);
  }

  @Patch(':id')
  @ResponseMessage('Promotion updated successfully')
  update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.promoService.update(id, dto);
  }

  @Delete(':id')
  @ResponseMessage('Promotion deleted successfully')
  remove(@Param('id') id: string) {
    return this.promoService.delete(id);
  }

  @Post('apply')
  @ResponseMessage('Promotion applied successfully')
  apply(@Body() dto: ApplyPromotionDto) {
    return this.promoService.validateAndApply(dto.code, dto.total);
  }
}
