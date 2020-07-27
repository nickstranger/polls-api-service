import { Repository, EntityRepository } from 'typeorm';
import { Logger, InternalServerErrorException } from '@nestjs/common';

import { CreatePollDto } from './dto/create-poll.dto';
import { Poll } from './poll.entity';

@EntityRepository(Poll)
export class PollRepository extends Repository<Poll> {
  private readonly logger = new Logger('PollRepository');

  async createPoll(createPollDto: CreatePollDto): Promise<Poll> {
    const { user } = createPollDto;
    const poll = this.create();
    poll.creatorCookie = user.userCookie;
    poll.creatorId = user.userId;
    poll.creatorUserAgent = user.userUA;
    poll.creatorIp = user.userIp;

    try {
      return await this.save(poll);
    } catch (error) {
      this.logger.error(`Failed on creating new Poll with data: ${JSON.stringify(createPollDto)}`);
      throw new InternalServerErrorException();
    }
  }
}
