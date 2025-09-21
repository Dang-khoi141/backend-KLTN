import { Injectable } from '@nestjs/common';
import { CreateStockIssueDto } from './../dto/create-stock-issue.dto';

@Injectable()
export class StockIssueService {
  create(dto: CreateStockIssueDto) {
    // TODO: Tạo phiếu xuất, cập nhật bảng stockissues, stockissuedetails
    // TODO: Giảm số lượng tồn kho trong bảng inventory
    return { message: 'Stock issue created', dto };
  }

  findAll() {
    return { message: 'All stock issues' };
  }

  findOne(id: string) {
    return { message: `Stock issue #${id}` };
  }
}
