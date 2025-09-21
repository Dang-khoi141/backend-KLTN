import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateStockIssueDto } from './../dto/create-stock-issue.dto';
import { StockIssueService } from './../services/stock-issue.service';

@Controller('stockissues')
export class StockIssueController {
  constructor(private readonly stockIssueService: StockIssueService) {}

  @Post()
  create(@Body() dto: CreateStockIssueDto) {
    return this.stockIssueService.create(dto);
  }

  @Get()
  findAll() {
    return this.stockIssueService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stockIssueService.findOne(id);
  }
}
