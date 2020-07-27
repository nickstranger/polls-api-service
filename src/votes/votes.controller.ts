import {
  Controller,
  Logger,
  Body,
  Param,
  ParseIntPipe,
  Get,
  Post,
  Delete,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';

import { VotesService } from './votes.service';
import { Vote } from './vote.entity';
import { CreateVoteDto } from './dto/create-vote.dto';
import { Question } from '../questions/question.entity';

@Controller('votes')
export class VotesController {
  constructor(private votesService: VotesService) {}

  private readonly logger = new Logger('VotesController');

  @Get('/:id')
  async getVoteById(@Param('id', ParseIntPipe) id: number): Promise<Vote> {
    this.logger.verbose(`Trying to fetch Vote with id: ${id}`);
    return this.votesService.getVoteById(id);
  }

  @Post()
  @UsePipes(ValidationPipe)
  async createVote(@Body() createVoteDto: CreateVoteDto): Promise<Question> {
    this.logger.verbose(`Trying to create Vote`);
    return this.votesService.createVote(createVoteDto);
  }

  @Delete('/:id')
  deleteVote(@Param('id', ParseIntPipe) id: number): Promise<Question> {
    this.logger.verbose(`Trying to delete Vote with id: ${id}`);
    return this.votesService.deleteVote(id);
  }
}
