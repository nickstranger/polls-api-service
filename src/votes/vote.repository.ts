import { EntityRepository, Repository } from 'typeorm';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Vote } from './vote.entity';
import { CreateVoteDto } from './dto/create-vote.dto';
import { Option } from '../options/option.entity';

@EntityRepository(Vote)
export class VoteRepository extends Repository<Vote> {
  private readonly logger = new Logger('VoteRepository');

  async createVote(createVoteDto: CreateVoteDto, option: Option): Promise<Vote> {
    const { user } = createVoteDto;

    const vote = this.create();
    vote.creatorCookie = user.userCookie;
    vote.creatorId = user.userId;
    vote.creatorIp = user.userIp;
    vote.creatorUserAgent = user.userUA;
    vote.option = option;
    vote.questionId = option.questionId;

    try {
      await this.save(vote);
      this.logger.verbose('New vote successfully saved');
      delete vote.option;
      return vote;
    } catch (err) {
      this.logger.error('Failed on saving vote', err);
      throw new InternalServerErrorException();
    }
  }
}
