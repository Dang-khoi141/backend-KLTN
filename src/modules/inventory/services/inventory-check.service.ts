import { Injectable } from '@nestjs/common';
import { CreateInventoryCheckDto } from './../dto/create-inventory-check.dto';

@Injectable()
export class InventoryCheckService {
  create(dto: CreateInventoryCheckDto) {
    // TODO: Tạo phiếu kiểm kê, lưu vào inventorychecks + inventorycheckdetails
    // TODO: Có thể điều chỉnh inventory theo variance
    return { message: 'Inventory check created', dto };
  }

  findAll() {
    return { message: 'All inventory checks' };
  }

  findOne(id: string) {
    return { message: `Inventory check #${id}` };
  }
}
