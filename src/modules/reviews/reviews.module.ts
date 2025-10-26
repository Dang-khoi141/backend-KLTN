import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { CatalogModule } from '../catalog/catalog.module';

@Module({
  imports: [TypeOrmModule.forFeature([Review]), CatalogModule],
  providers: [ReviewsService],
  controllers: [ReviewsController],
  exports: [ReviewsService],
})
export class ReviewsModule {}
