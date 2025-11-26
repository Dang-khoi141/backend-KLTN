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
import { ProductQueryDto, SortBy } from '../dto/product-query.dto';
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
    if (
      dto.discountPercentage === undefined ||
      dto.discountPercentage === null
    ) {
      dto.discountPercentage = 0;
    }

    let category:Category;
    if (dto.categoryId) {
      category = await this.categoryService.findOne(dto.categoryId);
    } else {
      category = await this.getDefaultCategory();
    }

    let brand:Brand;
    if (dto.brandId) {
      brand = await this.brandService.findOne(dto.brandId);
    }else {
      brand = await this.getDefaultBrand();
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

  async findAll(): Promise<any[]> {
    const products = await this.productRepository.find({
      relations: ['category', 'brand'],
    });

    return products.map((p) => {
      const discount = Number(p.discountPercentage) || 0;
      const price = Number(p.price);
      const finalPrice = price * (1 - discount / 100);

      return {
        ...p,
        finalPrice,
      };
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
      minRating,
      sortBy = SortBy.NEWEST,
      page = 1,
      limit = 20,
    } = query;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoin('reviews', 'review', 'review.product_id = product.id')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'avgRating')
      .addSelect('COUNT(DISTINCT review.id)', 'reviewCount')
      .groupBy('product.id')
      .addGroupBy('category.id')
      .addGroupBy('brand.id');

    if (search) {
      qb.andWhere(
        '(product.name LIKE :search OR product.description LIKE :search OR category.name LIKE :search)',
        { search: `%${search}%` },
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

    if (minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (minRating !== undefined && minRating > 0) {
      qb.having('AVG(review.rating) >= :minRating', { minRating });
    }

    switch (sortBy) {
      case SortBy.PRICE_ASC:
        qb.orderBy('product.price', 'ASC');
        break;
      case SortBy.PRICE_DESC:
        qb.orderBy('product.price', 'DESC');
        break;
      case SortBy.DISCOUNT:
        qb.orderBy('product.discountPercentage', 'DESC');
        break;
      case SortBy.RATING:
        qb.orderBy('avgRating', 'DESC');
        break;
      case SortBy.NEWEST:
      default:
        qb.orderBy('product.createdAt', 'DESC');
        break;
    }

    const totalQb = qb.clone();
    const total = (await totalQb.getMany()).length;

    qb.skip((page - 1) * limit).take(limit);

    const rawData = await qb.getRawAndEntities();

    const formatted = rawData.entities.map((p, index) => {
      const discount = Number(p.discountPercentage) || 0;
      const price = Number(p.price);
      const finalPrice = price * (1 - discount / 100);
      const avgRating = parseFloat(rawData.raw[index].avgRating) || 0;
      const reviewCount = parseInt(rawData.raw[index].reviewCount) || 0;

      return {
        ...p,
        finalPrice,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount,
      };
    });

    return {
      data: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<any> {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoin('reviews', 'review', 'review.product_id = product.id')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'avgRating')
      .addSelect('COUNT(DISTINCT review.id)', 'reviewCount')
      .where('product.id = :id', { id })
      .groupBy('product.id')
      .addGroupBy('category.id')
      .addGroupBy('brand.id');

    const result = await qb.getRawAndEntities();

    if (!result.entities || result.entities.length === 0) {
      throw new NotFoundException('Product not found');
    }

    const product = result.entities[0];
    const discount = Number(product.discountPercentage) || 0;
    const price = Number(product.price);
    const finalPrice = price * (1 - discount / 100);
    const avgRating = parseFloat(result.raw[0].avgRating) || 0;
    const reviewCount = parseInt(result.raw[0].reviewCount) || 0;

    return {
      ...product,
      finalPrice,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount,
    };
  }

  async getProductsByCategory(categoryId: string) {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoin('reviews', 'review', 'review.product_id = product.id')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'avgRating')
      .addSelect('COUNT(DISTINCT review.id)', 'reviewCount')
      .where('category.id = :categoryId', { categoryId })
      .groupBy('product.id')
      .addGroupBy('category.id')
      .addGroupBy('brand.id')
      .orderBy('product.createdAt', 'DESC');

    const result = await qb.getRawAndEntities();

    const formatted = result.entities.map((p, index) => {
      const discount = Number(p.discountPercentage) || 0;
      const price = Number(p.price);
      const finalPrice = price * (1 - discount / 100);
      const avgRating = parseFloat(result.raw[index].avgRating) || 0;
      const reviewCount = parseInt(result.raw[index].reviewCount) || 0;

      return {
        ...p,
        finalPrice,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount,
      };
    });

    return formatted;
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

  async countActive(): Promise<number> {
    const qb = this.productRepository.createQueryBuilder('product');
    qb.where('product.isActive = :isActive', { isActive: true });
    const count = await qb.getCount();
    return count;
  }

  async countByCategory(categoryName: string): Promise<number> {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('category.name LIKE :categoryName', {
        categoryName: `%${categoryName}%`,
      });

    return qb.getCount();
  }

  async getFeaturedProducts() {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .innerJoin('order_items', 'oi', 'oi.product_id = product.id')
      .innerJoin('orders', 'o', 'o.id = oi.order_id')
      .leftJoin('reviews', 'review', 'review.product_id = product.id')
      .addSelect('SUM(oi.quantity)', 'totalSold')
      .addSelect('COALESCE(AVG(review.rating), 0)', 'avgRating')
      .addSelect('COUNT(DISTINCT review.id)', 'reviewCount')
      .where(
        `o.status IN ('PAID','CONFIRMED','SHIPPED','DELIVERED')
       AND o.created_at >= NOW() - INTERVAL '7 days'`,
      )
      .groupBy('product.id')
      .addGroupBy('category.id')
      .addGroupBy('brand.id')

      .orderBy('"totalSold"', 'DESC')
      .limit(20);

    const result = await qb.getRawAndEntities();

    return result.entities.map((p, i) => {
      const discount = Number(p.discountPercentage) || 0;
      const price = Number(p.price);
      const finalPrice = price * (1 - discount / 100);

      return {
        ...p,
        finalPrice,
        avgRating:
          Math.round((parseFloat(result.raw[i].avgRating) || 0) * 10) / 10,
        reviewCount: parseInt(result.raw[i].reviewCount) || 0,
        totalSold: parseInt(result.raw[i].totalSold) || 0,
      };
    });
  }
}
