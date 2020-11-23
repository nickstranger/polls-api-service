import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult } from 'typeorm';

import { CreatePollDto } from './dto/create-poll.dto';
import { PollRepository } from './poll.repository';
import { Poll } from './poll.entity';
import { QuestionsService } from '../questions/questions.service';
import { PollStatus } from './poll.types';
import { UserDto } from '../utils/user.dto';

@Injectable()
export class PollsService {
  private readonly logger = new Logger('PollService');

  constructor(
    @InjectRepository(PollRepository)
    private pollRepository: PollRepository,
    private questionsService: QuestionsService
  ) {}

  async getShallowPollById(id: number): Promise<Poll> {
    const poll: Poll = await this.pollRepository.findOne({
      where: { id }
    });
    if (!poll) {
      this.logger.verbose(`Poll with id ${id} is not exists`);
      throw new NotFoundException(`Poll with id ${id} is not exists`);
    }
    this.logger.verbose(`Poll with id ${id} successfully found`);

    return poll;
  }

  async getPollById(id: number, user: UserDto, showResult: boolean): Promise<Poll> {
    const poll = await this.getShallowPollById(id);

    return await this.completePollToFull(poll, user, showResult);
  }

  async completePollToFull(
    poll: Poll,
    user: UserDto,
    showResult: boolean
  ): Promise<Poll> {
    poll.questions = await this.questionsService.getQuestionsByPoll(poll, user, showResult);
    poll.questionsCount = poll.questions.length;

    return poll;
  }

  async createPoll(createPollDto: CreatePollDto): Promise<Poll> {
    const createdPoll: Poll = await this.pollRepository.createPoll(createPollDto);

    const { questions } = createPollDto;
    createdPoll.questions = await this.questionsService.createQuestions(questions, createdPoll);

    return createdPoll;
  }

  async deactivatePoll(id: number, user: UserDto): Promise<Poll> {
    const poll = await this.getShallowPollById(id);

    if (poll.status === PollStatus.INACTIVE) {
      this.logger.error(`Poll with id ${id} was deactivated already`);
      throw new BadRequestException(`Poll with id ${id} was deactivated already`);
    }

    poll.status = PollStatus.INACTIVE;

    try {
      await this.pollRepository.save(poll);
      this.logger.verbose(`Poll with id ${id} successfully deactivated`);
    } catch (error) {
      this.logger.error(`Failed on deactivate Poll with id ${id}`);
      throw new InternalServerErrorException();
    }

    return await this.completePollToFull(poll, user, false);
  }

  async deletePoll(id: number): Promise<void> {
    const result: DeleteResult = await this.pollRepository.delete({ id });

    if (result && result.affected === 0) {
      this.logger.verbose(`Poll with id ${id} is not exists`);
      throw new NotFoundException(`Poll with id ${id} is not exists`);
    } else {
      this.logger.verbose(`Poll with id ${id} successfully deleted`);
    }
  }
}
