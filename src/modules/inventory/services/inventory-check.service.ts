import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InventoryCheck } from '../entities/inventory-check.entity';
import { InventoryCheckDetail } from '../entities/inventory-checkdetail.entity';
import { Inventory } from '../entities/inventory.entity';
import { CreateInventoryCheckDto } from '../dto/create-inventory-check.dto';

@Injectable()
export class InventoryCheckService {
  constructor(
    @InjectRepository(InventoryCheck)
    private readonly checkRepo: Repository<InventoryCheck>,
    @InjectRepository(InventoryCheckDetail)
    private readonly checkDetailRepo: Repository<InventoryCheckDetail>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  async create(dto: CreateInventoryCheckDto) {
    // 1. Tạo phiếu kiểm kê
    const check = this.checkRepo.create({
      warehouseId: dto.warehouseId,
      checkDate: dto.checkDate,
      checkedBy: dto.checkedBy,
      notes: dto.notes,
    });
    const savedCheck = await this.checkRepo.save(check);

    // 2. Duyệt qua chi tiết kiểm kê
    for (const d of dto.details) {
      // lấy tồn kho hệ thống
      const inventory = await this.inventoryRepo.findOne({
        where: { productId: d.productId },
      });

      const systemQty = inventory ? inventory.stock : 0;
      const variance = d.actualQuantity - systemQty;

      const detail = this.checkDetailRepo.create({
        check: savedCheck,
        productId: d.productId,
        systemQuantity: systemQty,
        actualQuantity: d.actualQuantity,
        variance,
        notes: d.notes,
      });

      await this.checkDetailRepo.save(detail);
    }

    return {
      message: 'Inventory check created successfully',
      id: savedCheck.id,
    };
  }

  async findAll() {
    return this.checkRepo.find({ relations: ['details'] });
  }

  async findOne(id: number) {
    const check = await this.checkRepo.findOne({
      where: { id },
      relations: ['details'],
    });
    if (!check) throw new BadRequestException('Inventory check not found');
    return check;
  }
}
