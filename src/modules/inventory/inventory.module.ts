import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StockReceipt } from './entities/stock-receipt.entity';
import { StockReceiptDetail } from './entities/stock-receipt-detail.entity';
import { StockIssue } from './entities/stock-issue.entity';
import { StockIssueDetail } from './entities/stock-issue-detail.entity';
import { InventoryCheck } from './entities/inventory-check.entity';
import { InventoryCheckDetail } from './entities/inventory-check-detail.entity';
import { Inventory } from './entities/inventory.entity';
import { Warehouse } from './entities/warehouse.entity';
import { ReceiptService } from './service/receipt.service';
import { IssueService } from './service/issue.service';
import { CheckService } from './service/check.service';
import { InventoryService } from './service/inventory.service';
import { ReceiptController } from './controller/receipt.controller';
import { IssueController } from './controller/issue.controller';
import { CheckController } from './controller/check.controller';
import { InventoryController } from './controller/inventory.controller';
import { Product } from '../catalog/entities/product.entity';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockReceipt,
      StockReceiptDetail,
      StockIssue,
      StockIssueDetail,
      InventoryCheck,
      InventoryCheckDetail,
      Inventory,
      Warehouse,
      Product,
    ]),
    CatalogModule,
  ],
  providers: [ReceiptService, IssueService, CheckService, InventoryService],
  controllers: [
    ReceiptController,
    IssueController,
    CheckController,
    InventoryController,
  ],
  exports: [ReceiptService, IssueService, CheckService, InventoryService],
})
export class InventoryModule {}
