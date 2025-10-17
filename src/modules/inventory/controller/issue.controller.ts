import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateIssueDto } from '../dto/create-issue.dto';
import { IssueService } from '../service/issue.service';
import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../user/enums/user-role.enum';

@Controller('inventory/issues')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Post()
  @ResponseMessage('Issue created successfully')
  async create(@Body() dto: CreateIssueDto, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return this.issueService.createIssue(dto, userId);
  }

  @Get()
  @ResponseMessage('Issues retrieved successfully')
  async findAll() {
    return this.issueService.findAll();
  }

  @Get(':id')
  @ResponseMessage('Issue retrieved successfully')
  async findOne(@Param('id') id: string) {
    return this.issueService.findOne(id);
  }
}
