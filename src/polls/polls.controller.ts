import {
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Delete,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
  Query
} from '@nestjs/common';

import { PollsService } from './polls.service';
import { Poll } from './poll.entity';
import { CreatePollDto } from './dto/create-poll.dto';
import { UserDto } from '../utils/user.dto';

@Controller('polls')
export class PollsController {
  constructor(private pollsService: PollsService) {}

  private readonly logger = new Logger('PollsController');

  @Get('/:id')
  async getPollById(
    @Param('id', ParseIntPipe) id: number,
    @Query() user: UserDto
  ): Promise<Poll> {
    this.logger.verbose(`Trying to fetch Poll with id: ${id}`);
    return this.pollsService.getPollById(id, user);
  }

  @Post('/:id/deactivate')
  async deactivatePoll(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.verbose(`Trying to deactivate Poll with id: ${id}`);
    return this.pollsService.deactivatePoll(id);
  }

  @Delete('/:id')
  deletePoll(@Param('id', ParseIntPipe) id: number): Promise<void> {
    this.logger.verbose(`Trying to delete Poll with id: ${id}`);
    return this.pollsService.deletePoll(id);
  }

  @Post()
  @UsePipes(ValidationPipe)
  async createPoll(@Body() createPollDto: CreatePollDto): Promise<Poll> {
    this.logger.verbose(`Trying to create Poll with data: ${JSON.stringify(createPollDto)}`);
    return this.pollsService.createPoll(createPollDto);
  }
}
