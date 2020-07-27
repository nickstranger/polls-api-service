import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OptionRepository } from './option.repository';
import { OptionsService } from './options.service';
import { VotesModule } from '../votes/votes.module';

@Module({
  imports: [TypeOrmModule.forFeature([OptionRepository]), VotesModule],
  controllers: [],
  providers: [OptionsService],
  exports: [OptionsService]
})
export class OptionsModule {}
