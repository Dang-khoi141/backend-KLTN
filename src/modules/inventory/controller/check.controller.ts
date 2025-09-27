import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { CreateCheckDto } from '../dto/create-check.dto';
import { CheckService } from '../service/check.service';

@Controller('inventory/checks')
export class CheckController {
  constructor(private readonly checkService: CheckService) {}

  @Post()
  async create(@Body() dto: CreateCheckDto, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return this.checkService.createCheck(dto, userId);
  }

  @Get()
  async findAll() {
    return this.checkService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.checkService.findOne(id);
  }
}
