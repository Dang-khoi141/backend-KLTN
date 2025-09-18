import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { Product } from './entities/product.entity';

import { CategoryService } from './services/category.service';
import { CategoryController } from './controllers/category.controller';
import { BrandService } from './services/brand.service';

import { ProductService } from './services/product.service';
import { ProductController } from './controllers/product.controller';
import { BrandController } from './controllers/brand.controller';
import { UploadModule } from '../uploads/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Brand, Product]), UploadModule],
  providers: [CategoryService, BrandService, ProductService],
  controllers: [CategoryController, BrandController, ProductController],
})
export class CatalogModule {}
