import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { CatalogModule } from '../catalog/catalog.module';
import { Order } from '../shopping/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Order]), CatalogModule],
  providers: [ReviewsService],
  controllers: [ReviewsController],
  exports: [ReviewsService],
})
export class ReviewsModule {}
