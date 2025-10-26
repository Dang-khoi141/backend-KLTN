import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateCheckDto } from '../dto/create-check.dto';
import { CheckService } from '../service/check.service';
import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../user/enums/user-role.enum';

@Controller('inventory/checks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class CheckController {
  constructor(private readonly checkService: CheckService) {}

  @Post()
  @ResponseMessage('Check created successfully')
  async create(@Body() dto: CreateCheckDto, @Req() req: any) {
    const userId = req.user?.userId || req.user?.id;
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
