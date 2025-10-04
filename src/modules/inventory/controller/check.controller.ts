import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { CreateCheckDto } from '../dto/create-check.dto';
import { CheckService } from '../service/check.service';
import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';

@Controller('inventory/checks')
export class CheckController {
  constructor(private readonly checkService: CheckService) {}

  @Post()
  @ResponseMessage('Check created successfully')
  async create(@Body() dto: CreateCheckDto, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return this.checkService.createCheck(dto, userId);
  }

  @Get()
  @ResponseMessage('Checks retrieved successfully')
  async findAll() {
    return this.checkService.findAll();
  }

  @Get(':id')
  @ResponseMessage('Check retrieved successfully')
  async findOne(@Param('id') id: string) {
    return this.checkService.findOne(id);
  }
}
