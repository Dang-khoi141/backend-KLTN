import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner, BannerPlacement } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner)
    private readonly bannerRepo: Repository<Banner>,
  ) {}

  async findAll() {
    return this.bannerRepo.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async getActiveBanners(placement?: BannerPlacement) {
    const query = this.bannerRepo
      .createQueryBuilder('banner')
      .where('banner.isActive = :active', { active: true });

    if (placement)
      query.andWhere('banner.placement = :placement', { placement });

    return query.orderBy('banner.sortOrder', 'ASC').getMany();
  }

  async getHeroSliderBanners() {
    return this.getActiveBanners(BannerPlacement.HERO_SLIDER);
  }

  async create(dto: CreateBannerDto) {
    const banner = this.bannerRepo.create(dto);
    return this.bannerRepo.save(banner);
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.bannerRepo.findOne({ where: { id } });
    if (!banner) throw new NotFoundException('Banner không tồn tại');
    Object.assign(banner, dto);
    return this.bannerRepo.save(banner);
  }

  async delete(id: string) {
    const result = await this.bannerRepo.delete(id);
    if (!result.affected) throw new NotFoundException('Banner không tồn tại');
    return { deleted: true };
  }

  async incrementView(id: string) {
    await this.bannerRepo.increment({ id }, 'viewCount', 1);
  }

  async incrementClick(id: string) {
    await this.bannerRepo.increment({ id }, 'clickCount', 1);
  }
}
