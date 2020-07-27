import { EntityRepository, Repository } from 'typeorm';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Question } from './question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Poll } from '../polls/poll.entity';

@EntityRepository(Question)
export class QuestionRepository extends Repository<Question> {
  private readonly logger = new Logger('QuestionRepository');

  async createQuestion(questionDto: CreateQuestionDto, poll: Poll): Promise<Question> {
    const question = this.create();
    question.text = questionDto.text;
    question.orderInPoll = questionDto.order;
    question.poll = poll;

    try {
      await this.save(question);
      this.logger.verbose('New question successfully saved');
      delete question.poll;
      return question;
    } catch (err) {
      this.logger.error('Failed on saving question', err);
      throw new InternalServerErrorException();
    }
  }

  // async updateQuestion(question: Question, updateValue: string): Promise<Question> {
  //   if (updateValue) {
  //     question.text = updateValue;
  //   }
  //
  //   try {
  //     await this.save(question);
  //     this.logger.verbose(
  //       `Question with ID ${question.id} successfully updated with new text: ${updateValue}`
  //     );
  //     return question;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed on update question with ID ${question.id} with new text: ${updateValue}`,
  //       error.stack
  //     );
  //     throw new InternalServerErrorException();
  //   }
  // }
}
