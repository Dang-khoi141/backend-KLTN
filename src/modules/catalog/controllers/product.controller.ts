import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductService } from '../services/product.service';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @Post()
  @ResponseMessage('Product created successfully')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProductDto })
  @UseInterceptors(FileInterceptor('file'))
  async createProduct(
    @Body() body: CreateProductDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    return this.productService.create(body, imageFile);
  }

  @Get()
  @ResponseMessage('Products retrieved successfully')
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @ResponseMessage('Product retrieved successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Product updated successfully')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProductDto })
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    return this.productService.update(id, dto, imageFile);
  }

  @Delete(':id')
  @ResponseMessage('Product deleted successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.remove(id);
  }
}
