import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { CreateReceiptDto } from '../dto/create-receipt.dto';
import { ReceiptService } from '../service/receipt.service';

@Controller('inventory/receipts')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post()
  async create(@Body() dto: CreateReceiptDto, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return this.receiptService.createReceipt(dto, userId);
  }

  @Get()
  async findAll() {
    return this.receiptService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.receiptService.findOne(id);
  }
}
