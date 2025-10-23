import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promoRepo: Repository<Promotion>,
  ) {}

  async findAll() {
    return this.promoRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    return this.promoRepo.findOne({ where: { id } });
  }

  async create(dto: CreatePromotionDto) {
    const exists = await this.promoRepo.findOne({ where: { code: dto.code } });
    if (exists) throw new BadRequestException('Mã khuyến mãi đã tồn tại');
    const promo = this.promoRepo.create(dto);
    return this.promoRepo.save(promo);
  }

  async update(id: string, dto: UpdatePromotionDto) {
    await this.promoRepo.update(id, dto);
    return this.findOne(id);
  }

  async delete(id: string) {
    await this.promoRepo.delete(id);
    return { deleted: true };
  }

  async validateAndApply(code: string, orderTotal: number) {
    const promo = await this.promoRepo.findOne({
      where: { code, isActive: true },
    });
    if (!promo) throw new BadRequestException('Mã khuyến mãi không hợp lệ');

    const now = new Date();
    if (promo.startDate && now < promo.startDate)
      throw new BadRequestException('Khuyến mãi chưa bắt đầu');
    if (promo.endDate && now > promo.endDate)
      throw new BadRequestException('Khuyến mãi đã hết hạn');
    if (promo.minOrderValue && orderTotal < promo.minOrderValue)
      throw new BadRequestException('Chưa đạt giá trị tối thiểu');

    const discount = promo.discountPercent
      ? (orderTotal * promo.discountPercent) / 100
      : promo.discountAmount || 0;

    return {
      discount,
      finalTotal: Math.max(orderTotal - discount, 0),
      promotion: promo,
    };
  }
  async getActivePromotions() {
    const now = new Date();

    const promos = await this.promoRepo
      .createQueryBuilder('promo')
      .where('promo.isActive = :active', { active: true })
      .andWhere('(promo.startDate IS NULL OR promo.startDate <= :now)', { now })
      .andWhere('(promo.endDate IS NULL OR promo.endDate >= :now)', { now })
      .orderBy('promo.createdAt', 'DESC')
      .getMany();

    return promos;
  }
}
