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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductService } from '../services/product.service';
import { ProductQueryDto } from '../dto/product-query.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { CreatePaymentDto } from '../../payment/types/dto';
import { PaymentService } from '../../payment/payment.service';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../user/enums/user-role.enum';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly paymentService: PaymentService,
  ) {}
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ResponseMessage('Product created successfully')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProductDto })
  @UseInterceptors(FileInterceptor('imageFile'))
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

  @Get('search')
  async search(@Query() query: ProductQueryDto) {
    return this.productService.search(query);
  }

  @Get(':id')
  @ResponseMessage('Product retrieved successfully')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ResponseMessage('Product deleted successfully')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.remove(id);
  }

  @Get(':id/pay')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  async createPaymentForProduct(@Param('id') id: string) {
    const product = await this.productService.findOne(id);

    const dto: CreatePaymentDto = {
      orderId: Date.now().toString(),
      description: `Thanh toán sản phẩm ${product.name}`,
      items: [
        {
          name: product.name,
          price: Number(product.price),
          quantity: 1,
        },
      ],
    };

    const payResponse = await this.paymentService.createPayment(dto);

    return {
      message: 'Tạo mã QR thanh toán thành công',
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
      },
      payment: payResponse,
    };
  }
  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ResponseMessage('Products imported successfully')
  async importProducts(@UploadedFile() file: Express.Multer.File) {
    return this.productService.importFromExcel(file);
  }
}
