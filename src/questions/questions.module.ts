import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QuestionRepository } from './question.repository';
import { QuestionsService } from './questions.service';
import { OptionsModule } from '../options/options.module';
import { VotesModule } from '../votes/votes.module';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionRepository]), OptionsModule, VotesModule],
  controllers: [],
  providers: [QuestionsService],
  exports: [QuestionsService]
})
export class QuestionsModule {}
