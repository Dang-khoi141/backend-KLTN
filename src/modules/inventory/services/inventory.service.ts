import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventoryDto } from '../dto/create-inventory.dto';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Inventory } from '../entities/inventory.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}
  create(createInventoryDto: CreateInventoryDto) {
    const inventory = this.inventoryRepo.create(createInventoryDto);
    return this.inventoryRepo.save(inventory);
  }

  findAll() {
    return this.inventoryRepo.find();
  }

  async findOne(productId: string) {
    const item = await this.inventoryRepo.findOne({ where: { productId } });
    if (!item)
      throw new NotFoundException(
        `Inventory not found for product ${productId}`,
      );
    return item;
  }

  async update(productId: string, updateInventoryDto: UpdateInventoryDto) {
    await this.inventoryRepo.update({ productId }, updateInventoryDto);
    return this.findOne(productId);
  }

  async remove(productId: string) {
    const result = await this.inventoryRepo.delete({ productId });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Inventory not found for product ${productId}`,
      );
    }
    return { message: `Inventory for product ${productId} removed` };
  }
}
