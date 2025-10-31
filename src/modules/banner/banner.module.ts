import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entities/banner.entity';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { Promotion } from '../promotion/entities/promotion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banner, Promotion])],
  controllers: [BannerController],
  providers: [BannerService],
  exports: [BannerService],
})
export class BannerModule {}
