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
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';

@Controller('inventory/issues')
@UseGuards(JwtAuthGuard)
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  @Post()
  async create(@Body() dto: CreateIssueDto, @Req() req: any) {
    const userId = req.user?.id || 'system';
    return this.issueService.createIssue(dto, userId);
  }

  @Get()
  async findAll() {
    return this.issueService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.issueService.findOne(id);
  }
}
