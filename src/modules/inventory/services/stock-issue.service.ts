import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StockIssue } from '../entities/stock-issue.entity';
import { StockIssueDetail } from '../entities/stock-issuedetail.entity';
import { Inventory } from '../entities/inventory.entity';

import { CreateStockIssueDto } from '../dto/create-stock-issue.dto';

@Injectable()
export class StockIssueService {
  constructor(
    @InjectRepository(StockIssue)
    private readonly stockIssueRepo: Repository<StockIssue>,
    @InjectRepository(StockIssueDetail)
    private readonly stockIssueDetailRepo: Repository<StockIssueDetail>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}
  async create(dto: CreateStockIssueDto) {
    // 1. Tạo phiếu xuất
    const issue = this.stockIssueRepo.create({
      warehouseId: dto.warehouseId,
      orderId: dto.orderId,
      issueDate: dto.issueDate,
      issuedBy: dto.issuedBy,
      receivedBy: dto.receivedBy,
      notes: dto.notes,
    });
    const savedIssue = await this.stockIssueRepo.save(issue);

    // 2. Tạo chi tiết phiếu xuất + cập nhật tồn kho
    for (const detail of dto.details) {
      const inventory = await this.inventoryRepo.findOne({
        where: { productId: detail.productId },
      });

      if (!inventory || inventory.stock < detail.quantity) {
        throw new BadRequestException(
          `Not enough stock for productId=${detail.productId}`,
        );
      }

      // tạo chi tiết phiếu xuất
      const issueDetail = this.stockIssueDetailRepo.create({
        issue: savedIssue,
        productId: detail.productId,
        quantity: detail.quantity,
      });
      await this.stockIssueDetailRepo.save(issueDetail);

      // trừ tồn kho
      inventory.stock -= detail.quantity;
      await this.inventoryRepo.save(inventory);
    }

    return {
      message: 'Stock issue created successfully',
      id: savedIssue.id,
    };
  }

  async findAll() {
    return await this.stockIssueRepo.find({
      relations: ['details'],
    });
  }

  async findOne(id: number) {
    return await this.stockIssueRepo.findOne({
      where: { id },
      relations: ['details'],
    });
  }
}
