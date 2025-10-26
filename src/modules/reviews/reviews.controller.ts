import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Roles(UserRole.CUSTOMER)
  @Post('product/:productId')
  @ResponseMessage('Review created successfully')
  async create(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateReviewDto,
    @Req() req,
  ) {
    return this.reviewsService.create(req.user, productId, dto);
  }

  @Get('product/:productId')
  @ResponseMessage('Product reviews retrieved successfully')
  async getByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.reviewsService.findByProduct(productId);
  }
  @Roles(UserRole.CUSTOMER)
  @Patch(':id')
  @ResponseMessage('Review updated successfully')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
    @Req() req,
  ) {
    return this.reviewsService.update(id, req.user, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.SUPERADMIN)
  @Delete(':id')
  @ResponseMessage('Review deleted successfully')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.reviewsService.remove(id, req.user);
  }
}
