import { Test } from '@nestjs/testing';

import { PollRepository } from '../polls/poll.repository';
import { Poll } from '../polls/poll.entity';
import { PollStatus } from '../polls/poll.types';

import { Question } from '../questions/question.entity';
import { QuestionRepository } from '../questions/question.repository';
import { QuestionState } from '../questions/question.types';

import { Option } from './option.entity';
import { OptionRepository } from './option.repository';
import { CreateOptionDto } from './dto/create-option.dto';

import { InternalServerErrorException } from '@nestjs/common';

describe('OptionRepository', () => {
  let optionRepository: OptionRepository;

  const mockPoll = new Poll();
  mockPoll.id = 1;
  mockPoll.status = PollStatus.ACTIVE;
  mockPoll.creatorIp = '1.1.1.1';
  mockPoll.creatorUserAgent = 'user agent';
  mockPoll.creatorCookie = 'some string';
  mockPoll.creatorId = 123;

  const mockQuestion = new Question();
  mockQuestion.id = 1;
  mockQuestion.orderInPoll = 1;
  mockQuestion.pollId = 1;
  mockQuestion.state = QuestionState.VOTING;

  const mockOption = new Option();
  mockOption.orderInQuestion = 1;
  mockOption.text = 'some option';

  const mockCreateOptionDto = new CreateOptionDto();
  mockCreateOptionDto.order = 1;
  mockCreateOptionDto.text = 'some option';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OptionRepository]
    }).compile();

    optionRepository = await module.get<OptionRepository>(OptionRepository);
  });

  describe('createOption', () => {
    it('Successfully creates a new Option', async () => {
      const optionRepositorySaveSpy = jest
        .spyOn(optionRepository, 'save')
        .mockResolvedValue(mockOption);

      const optionRepositoryCreateSpy = jest
        .spyOn(optionRepository, 'create')
        .mockReturnValue(mockOption);

      const result = await optionRepository.createOption(mockCreateOptionDto, mockQuestion);

      expect(optionRepositoryCreateSpy).toHaveBeenCalled();
      expect(optionRepositorySaveSpy).toHaveBeenCalled();
      expect(result).toEqual(mockOption);
    });

    it('failed on create a new Option', async () => {
      expect.assertions(1);

      jest
        .spyOn(optionRepository, 'save')
        .mockRejectedValue(new InternalServerErrorException('Some error'));

      jest.spyOn(optionRepository, 'create').mockReturnValue(mockOption);

      try {
        await optionRepository.createOption(mockCreateOptionDto, mockQuestion);
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
});
