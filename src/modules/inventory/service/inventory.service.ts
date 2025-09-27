import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory) private invRepo: Repository<Inventory>,
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
}
