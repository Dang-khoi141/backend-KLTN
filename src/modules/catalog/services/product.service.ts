import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { S3Service } from '../../uploads/upload.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { CategoryService } from './category.service';
import { BrandService } from './brand.service';
import { Brand } from '../entities/brand.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly s3Service: S3Service,
    private readonly categoryService: CategoryService,
    private readonly brandService: BrandService,
  ) {}

  async create(
    dto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<Product> {
    let category = await this.getDefaultCategory();
    if (dto.categoryId) {
      category = await this.categoryService.findOne(dto.categoryId);
    }

    let brand = await this.getDefaultBrand();
    if (dto.brandId) {
      brand = await this.brandService.findOne(dto.brandId);
    }

    const product = this.productRepository.create({
      ...dto,
      category,
      brand,
    });

    if (file) {
      const imageUrl = await this.s3Service.uploadFile(file, 'products');
      product.image = imageUrl;
    }

    return this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['category', 'brand'],
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
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
    const oldImageUrl = product.image;

    Object.assign(product, dto);

    if (file || dto.imageUrl) {
      let imageUrl: string | undefined = undefined;
      if (file) {
        imageUrl = await this.s3Service.uploadFile(file, 'products');
      } else if (dto.imageUrl) {
        imageUrl = await this.s3Service.uploadFromUrl(dto.imageUrl, 'products');
      }
      if (imageUrl) {
        product.image = imageUrl;

        if (oldImageUrl) {
          await this.s3Service.deleteFile(oldImageUrl);
        }
      }
    }

    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);

    if (product.image) {
      await this.s3Service.deleteFile(product.image);
    }

    await this.productRepository.delete(id);
  }

  private async getDefaultCategory(): Promise<Category> {
    return this.categoryService.findOrCreateDefault();
  }

  private async getDefaultBrand(): Promise<Brand> {
    return this.brandService.findOrCreateDefault();
  }
}
