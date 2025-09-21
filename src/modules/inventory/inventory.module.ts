import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InventoryController } from './controller/inventory.controller';
import { StockReceiptController } from './controller/stock-receipt.controller';
import { StockIssueController } from './controller/stock-issue.controller';
import { InventoryCheckController } from './controller/inventory-check.controller';

import { InventoryService } from './services/inventory.service';
import { StockReceiptService } from './services/stock-receipt.service';
import { StockIssueService } from './services/stock-issue.service';
import { InventoryCheckService } from './services/inventory-check.service';

import { Inventory } from './entities/inventory.entity';
import { StockReceipt } from './entities/stock-receipt.entity';
import { StockReceiptDetail } from './entities/stock-receiptdetail.entity';
import { StockIssue } from './entities/stock-issue.entity';
import { StockIssueDetail } from './entities/stock-issuedetail.entity';
import { InventoryCheck } from './entities/inventory-check.entity';
import { InventoryCheckDetail } from './entities/inventory-checkdetail.entity';
import { InventoryReportEntity } from './entities/inventory-report.entity';
import { InventoryReportController } from './controller/inventory-report.controller';
import { InventoryReportService } from './services/inventory-report.service';
import { Product } from '../catalog/entities/product.entity';
import { Brand } from '../catalog/entities/brand.entity';
import { Category } from '../catalog/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inventory,
      Product,
      Brand,
      Category,
      StockReceipt,
      StockReceiptDetail,
      StockIssue,
      StockIssueDetail,
      InventoryCheck,
      InventoryCheckDetail,
      InventoryReportEntity,
    ]),
  ],
  controllers: [
    InventoryController,
    StockReceiptController,
    StockIssueController,
    InventoryCheckController,
    InventoryReportController,
  ],
  providers: [
    InventoryService,
    StockReceiptService,
    StockIssueService,
    InventoryCheckService,
    InventoryReportService,
  ],
})
export class InventoryModule {}
