import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { ProductQueryDto } from '../dto/product-query.dto';
import * as XLSX from 'xlsx';

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

  async search(query: ProductQueryDto) {
    const {
      search,
      categoryId,
      brandId,
      isActive,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = query;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand');

    if (search) {
      qb.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId });
    }

    if (brandId) {
      qb.andWhere('brand.id = :brandId', { brandId });
    }

    if (isActive !== undefined) {
      qb.andWhere('product.isActive = :isActive', { isActive });
    }

    if (minPrice) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    qb.orderBy('product.createdAt', 'DESC');

    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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

  async importFromExcel(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

    if (!rows || rows.length === 0) {
      throw new BadRequestException('Excel file is empty');
    }

    const importedProducts: Product[] = [];

    for (const row of rows) {
      const name = row['name'] || row['Tên sản phẩm'];
      const price = Number(row['price'] || row['Giá']);
      const description = row['description'] || row['Mô tả'] || '';
      const imageUrl = row['imageUrl'] || row['Ảnh URL'];
      const categoryName = row['categoryName'] || row['Danh mục'];
      const brandName = row['brandName'] || row['Thương hiệu'];

      if (!name || !price) {
        throw new BadRequestException(`Thiếu dữ liệu: ${JSON.stringify(row)}`);
      }

      let uploadedImageUrl: string | undefined;
      if (imageUrl) {
        try {
          uploadedImageUrl = await this.s3Service.uploadFromUrl(
            imageUrl,
            'products',
          );
        } catch (e) {
          console.warn(`⚠️ Upload thất bại cho ảnh: ${imageUrl}`);
        }
      }

      let category = await this.getDefaultCategory();
      if (categoryName) {
        const existingCat = await this.categoryService.findByName(categoryName);
        if (existingCat) {
          category = existingCat;
        } else {
          category = await this.categoryService.createSimple(categoryName);
          console.log(`✅ Category mới tạo: ${categoryName}`);
        }
      }

      let brand = await this.getDefaultBrand();
      if (brandName) {
        const existingBrand = await this.brandService.findByName(brandName);
        if (existingBrand) {
          brand = existingBrand;
        } else {
          brand = await this.brandService.createSimple(brandName);
          console.log(`✅ Brand mới tạo: ${brandName}`);
        }
      }

      const product = this.productRepository.create({
        name,
        price,
        description,
        image: uploadedImageUrl,
        category,
        brand,
      });

      importedProducts.push(product);
    }

    await this.productRepository.save(importedProducts);

    return {
      message: 'Import sản phẩm thành công',
      importedCount: importedProducts.length,
    };
  }
}
