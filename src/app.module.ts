import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { typeOrmConfig } from './config/typeorm.config';
import { PollsModule } from './polls/polls.module';
import { QuestionsModule } from './questions/questions.module';
import { OptionsModule } from './options/options.module';
import { VotesModule } from './votes/votes.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    /**
     * @TODO apply cache strategy on ready 
    CacheModule.register(redisConfig), 
    */
    PollsModule,
    QuestionsModule,
    OptionsModule,
    VotesModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
