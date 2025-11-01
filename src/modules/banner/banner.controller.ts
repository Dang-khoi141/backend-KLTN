import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { BannerPlacement } from './entities/banner.entity';
import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UserRole } from '../user/enums/user-role.enum';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get()
  @ResponseMessage('Banner list retrieved successfully')
  findAll() {
    return this.bannerService.findAll();
  }

  @Get('active')
  @ResponseMessage('Active banners retrieved successfully')
  getActiveBanners(@Query('placement') placement?: BannerPlacement) {
    return this.bannerService.getActiveBanners(placement);
  }

  @Get('hero-slider')
  @ResponseMessage('Hero slider banners retrieved successfully')
  getHeroSliderBanners() {
    return this.bannerService.getHeroSliderBanners();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Post()
  @ResponseMessage('Banner created successfully')
  create(@Body() dto: CreateBannerDto) {
    return this.bannerService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Patch(':id')
  @ResponseMessage('Banner updated successfully')
  update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return this.bannerService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @Delete(':id')
  @ResponseMessage('Banner deleted successfully')
  remove(@Param('id') id: string) {
    return this.bannerService.delete(id);
  }

  @Post(':id/view')
  @ResponseMessage('View counted')
  trackView(@Param('id') id: string) {
    return this.bannerService.incrementView(id);
  }

  @Post(':id/click')
  @ResponseMessage('Click counted')
  trackClick(@Param('id') id: string) {
    return this.bannerService.incrementClick(id);
  }
}
