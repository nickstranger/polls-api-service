import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { PollRepository } from './poll.repository';
import { QuestionsModule } from '../questions/questions.module';

@Module({
  imports: [TypeOrmModule.forFeature([PollRepository]), QuestionsModule],
  controllers: [PollsController],
  providers: [PollsService]
})
export class PollsModule {}
