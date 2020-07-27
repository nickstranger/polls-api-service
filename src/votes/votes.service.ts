import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Vote } from './vote.entity';
import { VoteRepository } from './vote.repository';
import { CreateVoteDto } from './dto/create-vote.dto';
import { QuestionsService } from '../questions/questions.service';
import { OptionsService } from '../options/options.service';
import { UserDto } from '../utils/user.dto';
import { Question } from '../questions/question.entity';
import { QuestionState } from '../questions/question.types';

@Injectable()
export class VotesService {
  private readonly logger = new Logger('VoteService');

  constructor(
    @Inject(forwardRef(() => QuestionsService))
    private questionsService: QuestionsService,
    @Inject(forwardRef(() => OptionsService))
    private optionsService: OptionsService,
    @InjectRepository(VoteRepository)
    private voteRepository: VoteRepository
  ) {}

  async getVoteById(id: number): Promise<Vote> {
    const vote: Vote = await this.voteRepository.findOne({
      where: { id }
    });
    if (!vote) {
      this.logger.verbose(`Vote with id ${id} is not exists`);
      throw new NotFoundException(`Vote with id ${id} is not exists`);
    }
    this.logger.verbose(`Vote with id ${id} successfully found`);
    return vote;
  }

  async getVotesCountByQuestionId(questionId: number): Promise<number> {
    const count: number = await this.voteRepository.count({
      where: { questionId }
    });
    return count ?? 0;
  }

  async getVotesCountByOptionId(optionId: number): Promise<number> {
    const count: number = await this.voteRepository.count({
      where: { optionId }
    });
    return count || 0;
  }

  async hasUserVotedAlready(questionId: number, user: UserDto): Promise<boolean> {
    return Boolean(await this.getUserVoteByQuestionId(questionId, user));
  }

  async getUserVoteByQuestionId(questionId: number, user: UserDto): Promise<Vote> {
    const { userCookie, userId } = user;
    const userVote = await this.voteRepository.findOne({
      where: userId
        ? { questionId, creatorId: userId }
        : { questionId, creatorCookie: userCookie }
    });
    return userVote || null;
  }

  async createVote(createVoteDto: CreateVoteDto): Promise<Question> {
    const option = await this.optionsService.getOptionById(createVoteDto.optionId);
    const { user } = createVoteDto;
    const hasUserVotedAlready = await this.hasUserVotedAlready(option.questionId, user);
    if (hasUserVotedAlready) {
      this.logger.error('This user has already voted');
      throw new ForbiddenException('This user has already voted');
    }

    const vote = await this.voteRepository.createVote(createVoteDto, option);

    const question = await this.questionsService.getQuestionById(vote.questionId);
    return await this.questionsService.completeQuestionToFull(question, true, QuestionState.RESULT);
  }

  async deleteVote(id: number): Promise<Question> {
    const vote = await this.getVoteById(id);
    await this.voteRepository.remove(vote);
    this.logger.verbose(`Vote with ID ${id} successfully deleted`);

    const question = await this.questionsService.getQuestionById(vote.questionId);
    return await this.questionsService.completeQuestionToFull(
      question,
      false,
      QuestionState.VOTING
    );
  }
}
