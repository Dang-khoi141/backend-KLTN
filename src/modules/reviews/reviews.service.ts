import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Users } from '../user/entities/users.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UserRole } from '../user/enums/user-role.enum';
import { ProductService } from '../catalog/services/product.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly productService: ProductService,
  ) {}

  async create(
    user: any,
    productId: string,
    dto: CreateReviewDto,
  ): Promise<Review> {
    const fullUser = await this.reviewRepository.manager.findOne(Users, {
      where: { id: user.userId },
    });
    if (!fullUser) throw new NotFoundException('User not found');

    const product = await this.productService.findOne(productId);
    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.reviewRepository.findOne({
      where: { product: { id: productId }, user: { id: fullUser.id } },
    });
    if (existing)
      throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi');

    const review = this.reviewRepository.create({
      ...dto,
      product,
      user: fullUser,
    });

    return this.reviewRepository.save(review);
  }

  async findByProduct(productId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async update(id: string, user: any, dto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    if (review.user.id !== user.userId)
      throw new ForbiddenException(
        'Bạn không thể chỉnh sửa review của người khác',
      );

    Object.assign(review, dto);
    return this.reviewRepository.save(review);
  }

  async remove(id: string, user: any): Promise<void> {
    const review = await this.findOne(id);
    if (review.user.id !== user.userId && user.role !== UserRole.ADMIN)
      throw new ForbiddenException('Bạn không thể xóa review của người khác');

    await this.reviewRepository.delete(id);
  }
}
