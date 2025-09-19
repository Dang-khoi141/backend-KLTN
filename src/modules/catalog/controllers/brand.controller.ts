import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { BrandService } from '../services/brand.service';

@ApiTags('Brands')
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @ResponseMessage('Brand created successfully')
  @ApiBody({ type: CreateBrandDto })
  create(@Body() dto: CreateBrandDto) {
    return this.brandService.create(dto);
  }

  @Get()
  @ResponseMessage('Brands retrieved successfully')
  @ApiQuery({
    name: 'includeProducts',
    required: false,
    type: Boolean,
  })
  findAll(@Query('includeProducts') includeProducts?: string) {
    return this.brandService.findAll(includeProducts === 'true');
  }

  @Get(':id')
  @ResponseMessage('Brand retrieved successfully')
  @ApiQuery({
    name: 'includeProducts',
    required: false,
    type: Boolean,
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeProducts') includeProducts?: string,
  ) {
    return this.brandService.findOne(id, includeProducts === 'true');
  }

  @Patch(':id')
  @ResponseMessage('Brand updated successfully')
  @ApiBody({ type: UpdateBrandDto })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBrandDto) {
    return this.brandService.update(id, dto);
  }

  @Delete(':id')
  @ResponseMessage('Brand deleted successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandService.remove(id);
  }
}
