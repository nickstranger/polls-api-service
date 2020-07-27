import { EntityRepository, Repository } from 'typeorm';
import { InternalServerErrorException, Logger } from '@nestjs/common';

import { Option } from './option.entity';
import { CreateOptionDto } from './dto/create-option.dto';
import { Question } from '../questions/question.entity';

@EntityRepository(Option)
export class OptionRepository extends Repository<Option> {
  private readonly logger = new Logger('OptionRepository');

  async createOption(optionDto: CreateOptionDto, question: Question): Promise<Option> {
    const option = this.create();
    option.text = optionDto.text;
    option.orderInQuestion = optionDto.order;
    option.question = question;

    try {
      await this.save(option);
      this.logger.verbose('New option successfully saved');
      delete option.question;
      return option;
    } catch (err) {
      this.logger.error('Failed on saving option', err);
      throw new InternalServerErrorException();
    }
  }

  // async updateOption(option: Option, updateValue: string): Promise<Option> {
  //   if (updateValue) {
  //     option.text = updateValue;
  //   }
  //
  //   try {
  //     await this.save(option);
  //     this.logger.verbose(
  //       `Option with ID ${option.id} successfully updated with new text: ${updateValue}`
  //     );
  //     return option;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed on update option with ID ${option.id} with new text: ${updateValue}`,
  //       error.stack
  //     );
  //     throw new InternalServerErrorException();
  //   }
  // }
}
