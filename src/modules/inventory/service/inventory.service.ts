import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';
import { Product } from '../../catalog/entities/product.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private invRepo: Repository<Inventory>,
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async getStock(productId: string) {
    const inv = await this.invRepo.findOne({ where: { productId } });
    return inv?.stock ?? 0;
  }

  async getLowStockProducts() {
    return this.invRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.product', 'p')
      .where('i.stock <= i.low_stock_threshold')
      .getMany();
  }

  async getAllInventory() {
    return this.invRepo.find({ relations: ['product'] });
  }

  async importFromExcel(rows: any[]) {
    if (!rows || rows.length === 0) {
      throw new BadRequestException('Excel file is empty');
    }

    const inventories: Inventory[] = [];

    for (const row of rows) {
      const productId =
        row['product_id'] || row['Product ID'] || row['Mã sản phẩm'];
      const stock = Number(row['stock'] || row['Số lượng'] || 0);
      const lowStock = Number(
        row['low_stock_threshold'] || row['Ngưỡng tồn thấp'] || 10,
      );

      if (!productId) {
        throw new BadRequestException('Missing product_id in Excel data');
      }

      const product = await this.productRepo.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new BadRequestException(`Product not found: ${productId}`);
      }

      let inventory = await this.invRepo.findOne({ where: { productId } });

      if (inventory) {
        inventory.stock += stock;
        inventory.lowStockThreshold = lowStock || inventory.lowStockThreshold;
      } else {
        inventory = this.invRepo.create({
          productId,
          stock,
          lowStockThreshold: lowStock,
        });
      }

      inventories.push(inventory);
    }

    await this.invRepo.save(inventories);

    return { imported: inventories.length, message: 'Import successful' };
  }

  async decreaseStock(productId: string, quantity: number) {
    const inv = await this.invRepo.findOne({ where: { productId } });
    if (!inv) {
      throw new BadRequestException(
        `No inventory found for product ${productId}`,
      );
    }

    if (inv.stock < quantity) {
      throw new BadRequestException(
        `Not enough stock for product ${productId}. Available: ${inv.stock}, Requested: ${quantity}`,
      );
    }

    inv.stock -= quantity;
    await this.invRepo.save(inv);
    return inv;
  }

  async increaseStock(productId: string, quantity: number) {
    let inv = await this.invRepo.findOne({ where: { productId } });

    if (!inv) {
      const product = await this.productRepo.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new BadRequestException(`Product not found: ${productId}`);
      }

      inv = this.invRepo.create({
        productId,
        stock: quantity,
        lowStockThreshold: 10,
      });
    } else {
      inv.stock += quantity;
    }

    await this.invRepo.save(inv);
    return inv;
  }
}
