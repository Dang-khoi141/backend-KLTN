// src/product/product.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryModule } from '../category/category.module';
import { BrandModule } from '../brand/brand.module';
import { Product } from '../entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), CategoryModule, BrandModule],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
