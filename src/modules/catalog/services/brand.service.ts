import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../entities/brand.entity';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private brandRepo: Repository<Brand>,
  ) {}

  async create(dto: CreateBrandDto): Promise<Brand> {
    const brand = this.brandRepo.create(dto);
    return this.brandRepo.save(brand);
  }

  async findAll(): Promise<Brand[]> {
    return this.brandRepo.find();
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandRepo.findOne({ where: { id } });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);
    Object.assign(brand, dto);
    return this.brandRepo.save(brand);
  }

  async remove(id: string): Promise<void> {
    await this.brandRepo.delete(id);
  }
}
