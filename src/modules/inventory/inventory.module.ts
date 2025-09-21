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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inventory,
      StockReceipt,
      StockReceiptDetail,
      StockIssue,
      StockIssueDetail,
      InventoryCheck,
      InventoryCheckDetail,
    ]),
  ],
  controllers: [
    InventoryController,
    StockReceiptController,
    StockIssueController,
    InventoryCheckController,
  ],
  providers: [
    InventoryService,
    StockReceiptService,
    StockIssueService,
    InventoryCheckService,
  ],
})
export class InventoryModule {}
