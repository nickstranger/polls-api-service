import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, UpdateResult } from 'typeorm';

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

  async getPollById(id: number, user: UserDto): Promise<Poll> {
    const poll: Poll = await this.pollRepository.findOne({
      where: { id }
    });
    if (!poll) {
      this.logger.verbose(`Poll with id ${id} is not exists`);
      throw new NotFoundException(`Poll with id ${id} is not exists`);
    }
    this.logger.verbose(`Poll with id ${id} successfully found`);

    poll.questions = await this.questionsService.getQuestionsByPoll(poll, user);
    poll.questionsCount = poll.questions.length;

    return poll;
  }

  async createPoll(createPollDto: CreatePollDto): Promise<Poll> {
    const createdPoll: Poll = await this.pollRepository.createPoll(createPollDto);

    const { questions } = createPollDto;
    createdPoll.questions = await this.questionsService.createQuestions(questions, createdPoll);

    return createdPoll;
  }

  async deactivatePoll(id: number): Promise<void> {
    const updated: UpdateResult = await this.pollRepository.update(id, {
      status: PollStatus.INACTIVE
    });
    if (updated && updated.affected === 0) {
      this.logger.warn(`Poll with id ${id} doesn't exist`);
      throw new NotFoundException(`Poll with id ${id} is not exists`);
    } else {
      this.logger.verbose(`Poll with id ${id} successfully deactivated`);
    }
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
