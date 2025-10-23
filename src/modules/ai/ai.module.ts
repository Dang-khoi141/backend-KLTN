import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ProductService } from '../catalog/services/product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../catalog/entities/product.entity';
import { Category } from '../catalog/entities/category.entity';
import { Brand } from '../catalog/entities/brand.entity';
import { CategoryService } from '../catalog/services/category.service';
import { BrandService } from '../catalog/services/brand.service';
import { S3Service } from '../uploads/upload.service';
import { OpenAIController } from './ai.controller';
import { OpenAIService } from './ai.service';
import { PromotionModule } from '../promotion/promotion.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([Product, Category, Brand]),
    PromotionModule,
  ],
  controllers: [OpenAIController],
  providers: [
    OpenAIService,
    ProductService,
    CategoryService,
    BrandService,
    S3Service,
  ],
  exports: [OpenAIService],
})
export class OpenAIModule {}
