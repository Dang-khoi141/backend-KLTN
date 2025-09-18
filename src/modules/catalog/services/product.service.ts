import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { S3Service } from '../../uploads/upload.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    private readonly s3Service: S3Service,
  ) {}

  async create(
    dto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const product = this.productRepo.create(dto);

    if (file) {
      const imageUrl = await this.s3Service.uploadFile(file, 'products');
      product.image = imageUrl;
    }

    return this.productRepo.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepo.find({
      relations: ['category', 'brand'],
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'brand'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);

    if (file) {
      const imageUrl = await this.s3Service.uploadFile(file, 'products');
      product.image = imageUrl;
    }

    return this.productRepo.save(product);
  }

  async remove(id: string): Promise<void> {
    await this.productRepo.delete(id);
  }
}
