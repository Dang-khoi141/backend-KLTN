import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../entities/warehouse.entity';
import { CreateWarehouseDto } from '../dto/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  async create(dto: CreateWarehouseDto): Promise<Warehouse> {
    const warehouse = this.warehouseRepository.create(dto);
    return this.warehouseRepository.save(warehouse);
  }

  async findAll(): Promise<Warehouse[]> {
    return this.warehouseRepository.find();
  }

  async findOne(id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({ where: { id } });
    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${id} not found`);
    }
    return warehouse;
  }

  async update(id: string, dto: UpdateWarehouseDto): Promise<Warehouse> {
    const warehouse = await this.findOne(id);
    Object.assign(warehouse, dto);
    return this.warehouseRepository.save(warehouse);
  }

  async remove(id: string): Promise<void> {
    const warehouse = await this.findOne(id);
    await this.warehouseRepository.remove(warehouse);
  }
}
