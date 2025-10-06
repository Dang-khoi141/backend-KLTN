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
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { CategoryService } from '../services/category.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Category created successfully')
  @ApiBody({ type: CreateCategoryDto })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Get()
  @ResponseMessage('Categories retrieved successfully')
  @ApiQuery({ name: 'includeChildren', required: false, type: Boolean })
  findAll(@Query('includeChildren') includeChildren?: string) {
    return this.categoryService.findAll(includeChildren === 'true');
  }

  // @Get('tree')
  // getTree() {
  //   return this.categoryService.getTree();
  // }
  @Get('top')
  @ResponseMessage('Top categories retrieved successfully')
  getTopCategories(@Query('limit') limit?: string) {
    const topLimit = limit ? parseInt(limit, 10) : 5;
    return this.categoryService.findTopCategories(topLimit);
  }

  @Get(':id')
  @ResponseMessage('Category retrieved successfully')
  @ApiQuery({ name: 'includeRelations', required: false, type: Boolean })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeRelations') includeRelations?: string,
  ) {
    return this.categoryService.findOne(id, includeRelations === 'true');
  }

  @Get(':id/path')
  @ResponseMessage('Category path retrieved successfully')
  getPath(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.getPath(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Category updated successfully')
  @ApiBody({ type: UpdateCategoryDto })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Category deleted successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.remove(id);
  }
}
