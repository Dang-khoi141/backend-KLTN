import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryReportEntity } from '../entities/inventory-report.entity';
import {
  InventoryReportFilterDto,
  InventoryReportItemDto,
} from '../dto/create-inventory-report.dto';

@Injectable()
export class InventoryReportService {
  constructor(
    @InjectRepository(InventoryReportEntity)
    private readonly reportRepo: Repository<InventoryReportEntity>,
  ) {}

  async getReport(
    filter: InventoryReportFilterDto,
  ): Promise<InventoryReportItemDto[]> {
    let qb = this.reportRepo.createQueryBuilder('r');

    if (filter.brandId) {
      qb = qb.andWhere('r."brandId" = :brandId', { brandId: filter.brandId });
    }
    if (filter.categoryId) {
      qb = qb.andWhere('r."categoryId" = :categoryId', {
        categoryId: filter.categoryId,
      });
    }

    const rows = await qb.getMany();

    return rows.map((row) => {
      const stock = Number(row.stock);
      const threshold = Number(row.lowStockThreshold);

      return {
        productId: row.productId,
        productName: row.productName,
        brandName: row.brandName,
        categoryName: row.categoryName,
        stock,
        lowStockThreshold: threshold,
        status:
          stock <= 0 ? 'OUT_OF_STOCK' : stock <= threshold ? 'LOW_STOCK' : 'OK',
      };
    });
  }
}
