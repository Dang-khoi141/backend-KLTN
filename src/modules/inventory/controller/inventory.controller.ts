import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import { InventoryService } from '../service/inventory.service';
import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../user/enums/user-role.enum';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ResponseMessage('Inventory retrieved successfully')
  async getAll() {
    return this.inventoryService.getAllInventory();
  }

  @Get('low-stock')
  @ResponseMessage('Low stock products retrieved successfully')
  async getLowStock() {
    return this.inventoryService.getLowStockProducts();
  }

  @Get(':productId')
  @ResponseMessage('Product stock retrieved successfully')
  async getStock(@Param('productId') productId: string) {
    return this.inventoryService.getStock(productId);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Products imported successfully')
  async importInventory(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(worksheet);

    return this.inventoryService.importFromExcel(rows);
  }
}
