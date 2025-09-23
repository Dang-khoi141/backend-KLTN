import { Controller, Get, Query } from '@nestjs/common';
import { InventoryReportService } from '../services/inventory-report.service';
import { InventoryReportFilterDto } from '../dto/create-inventory-report.dto';

@Controller('inventory-reports')
export class InventoryReportController {
  constructor(private readonly reportService: InventoryReportService) {}

  @Get()
  async getReport(@Query() filter: InventoryReportFilterDto) {
    const data = await this.reportService.getReport(filter);
    return {
      message: 'Inventory report fetched successfully',
      count: data.length,
      data,
    };
  }
}
