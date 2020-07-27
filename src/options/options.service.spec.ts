import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { Option } from './option.entity';
import { OptionRepository } from './option.repository';
import { CreateOptionDto } from './dto/create-option.dto';
import { OptionsService } from './options.service';

import { Question } from '../questions/question.entity';
import { QuestionState } from '../questions/question.types';

import { Vote } from '../votes/vote.entity';
import { VotesService } from '../votes/votes.service';

describe('OptionsService', () => {
  let optionsService: OptionsService;
  let voteService: VotesService;
  let optionRepository: OptionRepository;

  const mockOptionRepository = () => ({
    findOne: jest.fn(),
    createOption: jest.fn(),
    find: jest.fn()
  });

  const mockVoteService = () => ({
    getVoteById: jest.fn(),
    getVotesCountBtQuestionId: jest.fn(),
    getVotesCountByOptionId: jest.fn(),
    hasUserVotedAlready: jest.fn(),
    createVote: jest.fn(),
    deleteVote: jest.fn()
  });

  const mockOption = new Option();
  mockOption.id = 1;
  mockOption.orderInQuestion = 1;
  mockOption.text = 'some option';
  mockOption.questionId = 10;

  const mockOptionVotes = new Option();
  mockOptionVotes.id = 1;
  mockOptionVotes.orderInQuestion = 1;
  mockOptionVotes.text = 'some option';
  mockOptionVotes.questionId = 10;
  mockOptionVotes.votesCount = 1

  const mockVote = new Vote();
  mockVote.id = 1;
  mockVote.optionId = 1;
  mockVote.questionId = 10;
  mockVote.creatorIp = '1.1.1.1';
  mockVote.creatorUserAgent = 'user agent';
  mockVote.creatorCookie = 'some string';
  mockVote.creatorId = 123;

  const mockCreateOptionDto = new CreateOptionDto();
  mockCreateOptionDto.order = 1;
  mockCreateOptionDto.text = 'some option';

  const mockQuestion = new Question();
  mockQuestion.id = 10;
  mockQuestion.orderInPoll = 1;
  mockQuestion.pollId = 1;
  mockQuestion.state = QuestionState.VOTING;
  mockQuestion.options = [mockOption];

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [],
      providers: [
        OptionsService,
        { provide: OptionRepository, useFactory: mockOptionRepository },
        { provide: VotesService, useFactory: mockVoteService }
      ]
    }).compile();

    optionsService = await module.get<OptionsService>(OptionsService);
    optionRepository = await module.get<OptionRepository>(OptionRepository);
    voteService = await module.get<VotesService>(VotesService);
  });

  describe('createOptions', () => {
    it('Create options success', async () => {
      spyOn(optionRepository, 'createOption').and.returnValue(mockOption);

      const result = await optionsService.createOptions([mockCreateOptionDto], mockQuestion);

      expect(optionRepository.createOption).toHaveBeenCalledWith(mockCreateOptionDto, mockQuestion);

      expect(result).toEqual([mockOption]);
    });
  });

  describe('getOptionById', () => {
    test('Should return a Option by Id', async () => {
      spyOn(optionRepository, 'findOne').and.returnValue(mockOption);
      spyOn(voteService, 'getVotesCountByOptionId').and.returnValue(3);

      const result = await optionsService.getOptionById(1);

      expect(optionRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result.votesCount).toEqual(3);
      expect(result).toEqual(mockOption);
    });

    test("Should throw NotFoundException in Option isn't exists", () => {
      spyOn(optionRepository, 'findOne').and.returnValue(null);

      const result = optionsService.getOptionById(30);

      expect(optionRepository.findOne).toHaveBeenCalledWith({ where: { id: 30 } });
      expect(result).rejects.toThrow(NotFoundException);
    });
  });

  describe('getOptionsByQuestion with false', () => {
    test('Get options by question with false param', async () => {
      spyOn(optionRepository, 'find').and.returnValue([mockOption]);

      const result = await optionsService.getOptionsByQuestion(mockQuestion, false);
      expect(optionRepository.find).toHaveBeenCalledWith({
        where: { questionId: 10 },
        order: { orderInQuestion: 'ASC' }
      });

      expect(result).toEqual([mockOption]);
    });

    test('Get options by question, that not exist', async () => {
      expect.assertions(1);
      spyOn(optionRepository, 'find').and.returnValue([]);

      try {
        await optionsService.getOptionsByQuestion(mockQuestion, false);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('getOptionsByQuestion with true', () => {
    test('Get options by question with true param', async () => {
      spyOn(optionRepository, 'find').and.returnValue([mockOption]);
      spyOn(voteService, 'getVotesCountByOptionId').and.returnValue(1);

      const result = await optionsService.getOptionsByQuestion(mockQuestion, true);
      const votes_count_result = await voteService.getVotesCountByOptionId(mockOptionVotes.id);
      expect(optionRepository.find).toHaveBeenCalledWith({
        where: { questionId: 10 },
        order: { orderInQuestion: 'ASC' }
      });
      expect(voteService.getVotesCountByOptionId).toHaveBeenCalledWith(mockOptionVotes.id);
      expect(result).toEqual([mockOptionVotes]);
      expect(votes_count_result).toEqual(1);
    });
    
    test('Get options by question, that not exist', async () => {
      expect.assertions(1);
      spyOn(optionRepository, 'find').and.returnValue([]);
  
      try {
        await optionsService.getOptionsByQuestion(mockQuestion, false);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
