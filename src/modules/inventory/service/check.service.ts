import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';
import { InventoryCheck } from '../entities/inventory-check.entity';
import { InventoryCheckDetail } from '../entities/inventory-check-detail.entity';
import { CreateCheckDto } from '../dto/create-check.dto';

@Injectable()
export class CheckService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Inventory) private invRepo: Repository<Inventory>,
    @InjectRepository(InventoryCheck)
    private checkRepo: Repository<InventoryCheck>,
  ) {}

  async createCheck(dto: CreateCheckDto, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const check = manager.create(InventoryCheck, {
        warehouse: { id: dto.warehouseId } as any,
        checkDate: new Date(),
        checkedBy: userId,
      });

      check.details = [];

      for (const it of dto.items) {
        const inv = await manager.findOne(Inventory, {
          where: { productId: it.productId },
        });
        const systemQty = inv?.stock ?? 0;
        const variance = it.actualQuantity - systemQty;

        if (inv) {
          inv.stock = it.actualQuantity;
          await manager.save(inv);
        } else {
          await manager.save(
            manager.create(Inventory, {
              productId: it.productId,
              stock: it.actualQuantity,
              lowStockThreshold: 10,
            }),
          );
        }

        check.details.push(
          manager.create(InventoryCheckDetail, {
            product: { id: it.productId } as any,
            systemQuantity: systemQty,
            actualQuantity: it.actualQuantity,
            variance,
          }),
        );
      }

      return manager.save(check);
    });
  }

  async findAll() {
    return this.checkRepo.find({
      relations: ['warehouse', 'details', 'details.product'],
    });
  }

  async findOne(id: string) {
    return this.checkRepo.findOne({
      where: { id },
      relations: ['warehouse', 'details', 'details.product'],
    });
  }
}
