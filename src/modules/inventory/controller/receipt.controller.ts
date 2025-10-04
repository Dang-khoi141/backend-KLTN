import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { CreateReceiptDto } from '../dto/create-receipt.dto';
import { ReceiptService } from '../service/receipt.service';
import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';

@Controller('inventory/receipts')
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) {}

  @Post()
  @ResponseMessage('Receipt created successfully')
  async create(@Body() dto: CreateReceiptDto, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return this.receiptService.createReceipt(dto, userId);
  }

  @Get()
  @ResponseMessage('Receipts retrieved successfully')
  async findAll() {
    return this.receiptService.findAll();
  }

  @Get(':id')
  @ResponseMessage('Receipt retrieved successfully')
  async findOne(@Param('id') id: string) {
    return this.receiptService.findOne(id);
  }
}
