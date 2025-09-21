import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateInventoryCheckDto } from './../dto/create-inventory-check.dto';
import { InventoryCheckService } from './../services/inventory-check.service';

@Controller('inventorychecks')
export class InventoryCheckController {
  constructor(private readonly inventoryCheckService: InventoryCheckService) {}

  @Post()
  create(@Body() dto: CreateInventoryCheckDto) {
    return this.inventoryCheckService.create(dto);
  }

  @Get()
  findAll() {
    return this.inventoryCheckService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryCheckService.findOne(id);
  }
}
