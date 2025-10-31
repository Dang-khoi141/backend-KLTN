import { IsEnum, IsInt, IsOptional, IsUrl, IsBoolean } from 'class-validator';
import { BannerPlacement } from '../entities/banner.entity';

export class CreateBannerDto {
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsEnum(BannerPlacement)
  placement?: BannerPlacement;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
