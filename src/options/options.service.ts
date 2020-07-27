import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Option } from './option.entity';
import { OptionRepository } from './option.repository';
import { CreateOptionDto } from './dto/create-option.dto';
import { Question } from '../questions/question.entity';
import { VotesService } from '../votes/votes.service';

@Injectable()
export class OptionsService {
  private readonly logger = new Logger('OptionService');

  constructor(
    private votesService: VotesService,
    @InjectRepository(OptionRepository)
    private optionRepository: OptionRepository
  ) {}

  async getOptionById(id: number): Promise<Option> {
    const option: Option = await this.optionRepository.findOne({
      where: { id }
    });
    if (!option) {
      this.logger.error(`Option with ID ${id} is not exists`);
      throw new NotFoundException(`Option with ID ${id} is not exists`);
    }
    this.logger.verbose(`Option with ID ${id} successfully found`);

    option.votesCount = await this.votesService.getVotesCountByOptionId(option.id);

    return option;
  }

  async getOptionsByQuestion(question: Question, withResults: boolean): Promise<Option[]> {
    const options: Option[] = await this.optionRepository.find({
      where: { questionId: question.id },
      order: { orderInQuestion: 'ASC' }
    });

    if (options.length === 0) {
      this.logger.verbose(`No options found by ${question.id}`);
      throw new NotFoundException(`Options not exist for question id ${question.id}`);
    }

    if (withResults) {
      const promises = options.map(async (option) => {
        option.votesCount = await this.votesService.getVotesCountByOptionId(option.id);
      });
      await Promise.all(promises);
    }

    return options;
  }

  async createOptions(optionsDto: CreateOptionDto[], question: Question): Promise<Array<Option>> {
    const createdOptions: Array<Promise<Option>> = optionsDto.map((optionDto) => {
      return this.optionRepository.createOption(optionDto, question);
    });
    return await Promise.all(createdOptions);
  }

  // async updateOption(id: number, updateValue: string): Promise<Option> {
  //   const option: Option = await this.getOptionById(id);
  //
  //   return await this.optionRepository.updateOption(option, updateValue);
  // }
}
