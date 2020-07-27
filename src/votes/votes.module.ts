import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VoteRepository } from './vote.repository';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { QuestionsModule } from '../questions/questions.module';
import { OptionsModule } from '../options/options.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VoteRepository]),
    forwardRef(() => QuestionsModule),
    forwardRef(() => OptionsModule)
  ],
  controllers: [VotesController],
  providers: [VotesService],
  exports: [VotesService]
})
export class VotesModule {}
