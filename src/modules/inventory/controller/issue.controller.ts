import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { CreateIssueDto } from '../dto/create-issue.dto';
import { IssueService } from '../service/issue.service';
import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';

@Controller('inventory/issues')
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
