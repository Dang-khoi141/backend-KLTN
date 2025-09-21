import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { StockReceiptService } from '../services/stock-receipt.service';
import { CreateStockReceiptDto } from '../dto/create-stock-receipt.dto';

@Controller('stockreceipts')
export class StockReceiptController {
  constructor(private readonly stockReceiptService: StockReceiptService) {}

  @Post()
  create(@Body() dto: CreateStockReceiptDto) {
    return this.stockReceiptService.create(dto);
  }

  @Get()
  findAll() {
    return this.stockReceiptService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockReceiptService.findOne(id);
  }
}
