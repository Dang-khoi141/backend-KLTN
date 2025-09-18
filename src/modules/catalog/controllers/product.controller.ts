import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createProduct(
    @Body() body: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productService.create(body, file);
  }
  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
