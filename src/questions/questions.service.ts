import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Question } from './question.entity';
import { QuestionRepository } from './question.repository';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Poll } from '../polls/poll.entity';
import { OptionsService } from '../options/options.service';
import { QuestionState } from './question.types';
import { PollStatus } from '../polls/poll.types';
import { UserDto } from '../utils/user.dto';
import { VotesService } from '../votes/votes.service';

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger('QuestionService');

  constructor(
    @InjectRepository(QuestionRepository)
    private questionRepository: QuestionRepository,
    private optionsService: OptionsService,
    private votesService: VotesService
  ) {}

  // дополняет неполную сущность Question, которая берется из БД, до полной сущности со всеми остальными полями
  async completeQuestionToFull(
    question: Question,
    optionsWithResults: boolean = false,
    questionState: QuestionState,
    user?: UserDto
  ): Promise<Question> {
    const resultQuestion = { ...question };
    const promises: Promise<any>[] = [];

    const optionsPromise = this.optionsService.getOptionsByQuestion(question, optionsWithResults);
    const votesCountPromise = this.votesService.getVotesCountByQuestionId(question.id);
    let userVotePromise = null;
    if (questionState === QuestionState.RESULT && user) {
      userVotePromise = this.votesService.getUserVoteByQuestionId(question.id, user);
    }

    promises.push(optionsPromise, votesCountPromise, userVotePromise);

    [
      resultQuestion.options,
      resultQuestion.votesCount,
      resultQuestion.userVote
    ] = await Promise.all(promises);
    resultQuestion.state = questionState;
    resultQuestion.optionsCount = resultQuestion.options.length;

    return resultQuestion;
  }

  async getQuestionById(id: number): Promise<Question> {
    const found: Question = await this.questionRepository.findOne({
      where: { id }
    });
    if (!found) {
      this.logger.error(`Question with ID ${id} is not exists`);
      throw new NotFoundException(`Question with ID ${id} is not exists`);
    }
    this.logger.verbose(`Question with ID ${id} successfully found`);
    return found;
  }

  async getQuestionsByPoll(poll: Poll, user: UserDto): Promise<Question[]> {
    const questions: Question[] = await this.questionRepository.find({
      where: { pollId: poll.id },
      order: { orderInPoll: 'ASC' }
    });

    if (questions.length === 0) {
      this.logger.verbose(`No question found by ${poll.id}`);
      throw new NotFoundException(`Questions not exist for Poll id ${poll.id}`);
    }
    this.logger.verbose(`Questions for Poll with id ${poll.id} successfully found`);

    const promises = questions.map(async (question) => {
      const hasUserVotedAlready: boolean = await this.votesService.hasUserVotedAlready(
        question.id,
        user
      );
      const questionState =
        poll.status === PollStatus.INACTIVE || hasUserVotedAlready
          ? QuestionState.RESULT
          : QuestionState.VOTING;
      const optionsWithResults = questionState === QuestionState.RESULT;
      return await this.completeQuestionToFull(
        question,
        optionsWithResults,
        questionState,
        user
      );
    });

    return await Promise.all(promises);
  }

  async createQuestions(questionsDto: CreateQuestionDto[], poll: Poll): Promise<Array<Question>> {
    const createdQuestions: Array<Promise<Question>> = questionsDto.map(async (questionDto) => {
      const createdQuestion = await this.questionRepository.createQuestion(questionDto, poll);

      const { options } = questionDto;
      createdQuestion.options = await this.optionsService.createOptions(options, createdQuestion);

      return createdQuestion;
    });

    return await Promise.all(createdQuestions);
  }

  // async updateQuestion(id: number, updateValue: string): Promise<Question> {
  //   const question: Question = await this.getQuestionById(id);
  //
  //   return await this.questionRepository.updateQuestion(question, updateValue);
  // }
  //
  // async deleteQuestions(ids: Array<number>): Promise<void> {
  //   // метод delete принимает и массив значений, но тогда не получится сделать хорошее логирование
  //   for (const id of ids) {
  //     const result: DeleteResult = await this.questionRepository.delete(id);
  //
  //     if (result && result.affected === 0) {
  //       this.logger.error(`Question with ID ${id} not found`);
  //       throw new NotFoundException(`Question with ID ${id} not found`);
  //     } else {
  //       this.logger.verbose(`Question with ID ${id} successfully deleted`);
  //     }
  //   }
  // }
}
