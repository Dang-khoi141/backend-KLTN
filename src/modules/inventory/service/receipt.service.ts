import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StockReceipt } from '../entities/stock-receipt.entity';
import { StockReceiptDetail } from '../entities/stock-receipt-detail.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { Inventory } from '../entities/inventory.entity';
import { CreateReceiptDto } from '../dto/create-receipt.dto';

@Injectable()
export class ReceiptService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(StockReceipt)
    private receiptRepo: Repository<StockReceipt>,
    @InjectRepository(Inventory) private invRepo: Repository<Inventory>,
    @InjectRepository(Warehouse) private whRepo: Repository<Warehouse>,
  ) {}

  async createReceipt(dto: CreateReceiptDto, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const warehouse = await manager.findOne(Warehouse, {
        where: { id: dto.warehouseId },
      });
      if (!warehouse) throw new NotFoundException('Warehouse not found');

      const receipt = manager.create(StockReceipt, {
        warehouse,
        receiptDate: new Date(),
        receivedBy: userId,
        totalValue: 0,
      });

      receipt.details = await Promise.all(
        dto.items.map((it) =>
          manager.create(StockReceiptDetail, {
            product: { id: it.productId } as any,
            quantity: it.quantity,
            unitCost: it.unitCost,
          }),
        ),
      );

      for (const it of dto.items) {
        const inv = await manager.findOne(Inventory, {
          where: { productId: it.productId },
        });
        if (inv) {
          inv.stock += it.quantity;
          await manager.save(inv);
        } else {
          await manager.save(
            manager.create(Inventory, {
              productId: it.productId,
              stock: it.quantity,
              lowStockThreshold: 10,
            }),
          );
        }
      }

      receipt.totalValue = dto.items.reduce(
        (sum, it) => sum + it.quantity * it.unitCost,
        0,
      );

      return manager.save(receipt);
    });
  }

  async findAll() {
    return this.receiptRepo.find({
      relations: ['warehouse', 'details', 'details.product'],
    });
  }

  async findOne(id: string) {
    return this.receiptRepo.findOne({
      where: { id },
      relations: ['warehouse', 'details', 'details.product'],
    });
  }
}
