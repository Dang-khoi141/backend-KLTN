import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, ILike } from 'typeorm';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { Brand } from '../entities/brand.entity';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
  ) {}

  async create(dto: CreateBrandDto): Promise<Brand> {
    const existingBrand = await this.brandRepository.findOne({
      where: { name: dto.name },
    });

    if (existingBrand) {
      throw new BadRequestException('Brand name already exists');
    }

    const brand = this.brandRepository.create(dto);
    return this.brandRepository.save(brand);
  }

  async findOrCreateDefault(): Promise<Brand> {
    let brand = await this.brandRepository.findOne({
      where: { name: 'No Brand' },
    });

    if (!brand) {
      const defaultBrand: DeepPartial<Brand> = {
        name: 'No Brand',
        contactName: 'Default contact',
        phone: undefined,
        email: undefined,
        address: undefined,
      };

      brand = this.brandRepository.create(defaultBrand);
      brand = await this.brandRepository.save(brand);
    }

    return brand;
  }

  async findAll(includeProducts = false): Promise<Brand[]> {
    const relations = includeProducts ? ['products'] : [];

    return this.brandRepository.find({
      relations,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, includeProducts = false): Promise<Brand> {
    const relations = includeProducts ? ['products'] : [];

    const brand = await this.brandRepository.findOne({
      where: { id },
      relations,
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    return brand;
  }

  async update(id: string, dto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);

    if (dto.name && dto.name !== brand.name) {
      const existingBrand = await this.brandRepository.findOne({
        where: { name: dto.name },
      });

      if (existingBrand) {
        throw new BadRequestException('Brand name already exists');
      }
    }

    Object.assign(brand, dto);
    return this.brandRepository.save(brand);
  }

  async remove(id: string): Promise<void> {
    const brand = await this.brandRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    if (brand.products && brand.products.length > 0) {
      throw new BadRequestException(
        'Cannot delete brand with associated products',
      );
    }

    await this.brandRepository.delete(id);
  }

  async findByName(name: string): Promise<Brand | null> {
    return this.brandRepository.findOne({
      where: { name: ILike(name) },
    });
  }

  async createSimple(name: string): Promise<Brand> {
    const brand = this.brandRepository.create({
      name,
      contactName: 'Auto created',
    });
    return this.brandRepository.save(brand);
  }
}
