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
import { ReviewableProductDto } from './dto/reviewable-product.dto';
import { UserRole } from '../user/enums/user-role.enum';
import { ProductService } from '../catalog/services/product.service';
import { Order, OrderStatus } from '../shopping/entities/order.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly productService: ProductService,
  ) {}

  async hasUserPurchasedProduct(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    const deliveredOrder = await this.orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.items', 'item')
      .innerJoin('order.user', 'user')
      .innerJoin('item.product', 'product')
      .where('user.id = :userId', { userId })
      .andWhere('product.id = :productId', { productId })
      .andWhere('order.status = :status', { status: OrderStatus.DELIVERED })
      .getOne();

    return !!deliveredOrder;
  }

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

    const hasPurchased = await this.hasUserPurchasedProduct(
      fullUser.id,
      productId,
    );
    if (!hasPurchased) {
      throw new BadRequestException(
        'Chỉ khách hàng đã mua sản phẩm mới có thể đánh giá',
      );
    }

    const existing = await this.reviewRepository.findOne({
      where: { product: { id: productId }, user: { id: fullUser.id } },
    });
    if (existing)
      throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi');

    const review = this.reviewRepository.create({
      ...dto,
      product,
      user: fullUser,
      isVerifiedPurchase: true,
    });

    return this.reviewRepository.save(review);
  }

  async findByProduct(productId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        rating: true,
        comment: true,
        isVerifiedPurchase: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    });
  }

  async findUserReviewForProduct(
    userId: string,
    productId: string,
  ): Promise<Review | null> {
    const review = await this.reviewRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
      relations: ['user'],
      select: {
        id: true,
        rating: true,
        comment: true,
        isVerifiedPurchase: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    });

    return review;
  }

  async findByUser(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        rating: true,
        comment: true,
        isVerifiedPurchase: true,
        createdAt: true,
        updatedAt: true,
        product: {
          id: true,
          name: true,
          image: true,
        },
        user: {
          id: true,
          name: true,
          avatar: true,
        },
      },
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

  async getReviewableProducts(userId: string): Promise<ReviewableProductDto[]> {
    const deliveredOrders = await this.orderRepository.find({
      where: { user: { id: userId }, status: OrderStatus.DELIVERED },
      relations: ['items', 'items.product'],
    });

    const reviewedProductIds = await this.reviewRepository
      .find({
        where: { user: { id: userId } },
        relations: ['product'],
      })
      .then((reviews) => reviews.map((r) => r.product.id));

    const reviewableProducts: ReviewableProductDto[] = [];

    for (const order of deliveredOrders) {
      for (const item of order.items) {
        if (!reviewedProductIds.includes(item.product.id)) {
          reviewableProducts.push({
            orderId: order.id,
            orderNumber: order.orderNumber,
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.image,
            deliveredAt: order.updatedAt,
          });
        }
      }
    }

    return reviewableProducts;
  }
}
