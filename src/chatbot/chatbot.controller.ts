import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';

@Controller('chatbot')
@UseGuards(JwtAuthGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('chat')
  async chat(@Body() chatDto: ChatDto, @Request() req: RequestWithUser) {
    const response = await this.chatbotService.chat(req.user, chatDto.message);
    return {
      response,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('search')
  async searchFolders(
    @Body() body: { query: string },
    @Request() req: RequestWithUser,
  ) {
    const results = await this.chatbotService.searchFolders(
      body.query,
      req.user,
    );
    return {
      query: body.query,
      results,
      count: results.length,
    };
  }
}

