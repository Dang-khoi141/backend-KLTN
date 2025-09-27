import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StockIssue } from '../entities/stock-issue.entity';
import { StockIssueDetail } from '../entities/stock-issue-detail.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { Inventory } from '../entities/inventory.entity';
import { CreateIssueDto } from '../dto/create-issue.dto';

@Injectable()
export class IssueService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(StockIssue) private issueRepo: Repository<StockIssue>,
    @InjectRepository(Inventory) private invRepo: Repository<Inventory>,
    @InjectRepository(Warehouse) private whRepo: Repository<Warehouse>,
  ) {}

  async createIssue(dto: CreateIssueDto, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const warehouse = await manager.findOne(Warehouse, {
        where: { id: dto.warehouseId },
      });
      if (!warehouse) throw new NotFoundException('Warehouse not found');

      const issue = manager.create(StockIssue, {
        warehouse,
        orderId: dto.orderId,
        issueDate: new Date(),
        issuedBy: userId,
      });

      issue.details = [];

      for (const it of dto.items) {
        const inv = await manager.findOne(Inventory, {
          where: { productId: it.productId },
        });
        if (!inv || inv.stock < it.quantity) {
          throw new BadRequestException(
            `Not enough stock for product ${it.productId}`,
          );
        }

        inv.stock -= it.quantity;
        await manager.save(inv);

        issue.details.push(
          manager.create(StockIssueDetail, {
            product: { id: it.productId } as any,
            quantity: it.quantity,
          }),
        );
      }

      return manager.save(issue);
    });
  }

  async findAll() {
    return this.issueRepo.find({
      relations: ['warehouse', 'details', 'details.product'],
    });
  }

  async findOne(id: string) {
    return this.issueRepo.findOne({
      where: { id },
      relations: ['warehouse', 'details', 'details.product'],
    });
  }
}
