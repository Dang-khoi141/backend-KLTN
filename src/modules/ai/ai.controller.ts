import { Body, Controller, Post } from '@nestjs/common';

import { ResponseMessage } from 'src/modules/common/decorators/response-message.decorator';
import { OpenAIService } from './ai.service';

@Controller('ai')
export class OpenAIController {
  constructor(private readonly openAIService: OpenAIService) {}

  @Post('query')
  @ResponseMessage('AI suggestion retrieved successfully')
  async query(@Body('message') message: string) {
    const result = await this.openAIService.handleQuery(message);
    return result;
  }
}
