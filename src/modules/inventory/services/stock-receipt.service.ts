import { Injectable } from '@nestjs/common';
import { CreateStockReceiptDto } from '../dto/create-stock-receipt.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StockReceipt } from '../entities/stock-receipt.entity';
import { StockReceiptDetail } from '../entities/stock-receiptdetail.entity';
import { Repository } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';

@Injectable()
export class StockReceiptService {
  constructor(
    @InjectRepository(StockReceipt)
    private readonly stockReceiptRepo: Repository<StockReceipt>,
    @InjectRepository(StockReceiptDetail)
    private readonly stockReceiptDetailRepo: Repository<StockReceiptDetail>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}
  async create(dto: CreateStockReceiptDto) {
    // Tạo phiếu nhập
    const receipt = this.stockReceiptRepo.create({
      warehouseId: dto.warehouseId,
      brandId: dto.brandId,
      receiptDate: dto.receiptDate,
      totalValue: dto.totalValue,
      receivedBy: dto.receivedBy,
      notes: dto.notes,
    });
    const savedReceipt = await this.stockReceiptRepo.save(receipt);

    // Tạo chi tiết phiếu nhập + cập nhật tồn kho
    for (const detail of dto.details) {
      const receiptDetail = this.stockReceiptDetailRepo.create({
        receipt: savedReceipt,
        productId: detail.productId,
        quantity: detail.quantity,
        unitCost: detail.unitCost,
        expiryDate: detail.expiryDate,
      });
      await this.stockReceiptDetailRepo.save(receiptDetail);

      // update tồn kho
      let inventory = await this.inventoryRepo.findOne({
        where: { productId: detail.productId },
      });

      if (!inventory) {
        inventory = this.inventoryRepo.create({
          productId: detail.productId,
          stock: detail.quantity,
        });
      } else {
        inventory.stock += detail.quantity;
      }

      await this.inventoryRepo.save(inventory);
    }

    return {
      message: 'Stock receipt created successfully',
      id: savedReceipt.id,
    };
  }

  findAll() {
    return { message: 'All stock receipts' };
  }

  findOne(id: string) {
    return { message: `Stock receipt #${id}` };
  }
}
