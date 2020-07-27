import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CreateVoteDto } from './dto/create-vote.dto';
import { Vote } from './vote.entity';
import { VoteRepository } from './vote.repository';
import { VotesService } from './votes.service';
import { Question } from '../questions/question.entity';
import { QuestionsService } from '../questions/questions.service';
import { QuestionState } from '../questions/question.types';
import { Option } from '../options/option.entity';
import { OptionsService } from '../options/options.service';
import { UserDto } from '../utils/user.dto';

describe('VotesService', () => {
  let votesService: VotesService;
  let voteRepository;
  let questionsService;
  let optionsService;

  const mockUser = new UserDto();
  mockUser.userCookie = 'some string';

  const mockVote = new Vote();
  mockVote.id = 10;
  mockVote.questionId = 5;
  // mockVote.user = mockUser;

  const mockQuestion = new Question();

  const mockOption = new Option();
  mockOption.questionId = 5;

  const mockVoteRepository = () => ({
    findOne: jest.fn(),
    count: jest.fn(),
    remove: jest.fn(),
    getVoteById: jest.fn(),
    createVote: jest.fn()
  });

  const mockQuestionsService = () => ({
    getQuestionById: jest.fn(),
    completeQuestionToFull: jest.fn()
  });

  const mockOptionsService = () => ({
    getOptionById: jest.fn()
  });

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        VotesService,
        { provide: VoteRepository, useFactory: mockVoteRepository },
        { provide: QuestionsService, useFactory: mockQuestionsService },
        { provide: OptionsService, useFactory: mockOptionsService }
      ]
    }).compile();

    votesService = await module.get<VotesService>(VotesService);
    voteRepository = await module.get<VoteRepository>(VoteRepository);
    questionsService = await module.get<QuestionsService>(QuestionsService);
    optionsService = await module.get<OptionsService>(OptionsService);
  });

  describe('getVoteById', () => {
    it('Should return a Vote by Id', async () => {
      voteRepository.findOne.mockResolvedValue(mockVote);
      const result = await votesService.getVoteById(10);

      expect(voteRepository.findOne).toHaveBeenCalledWith({ where: { id: 10 } });
      expect(result).toEqual(mockVote);
    });

    it("Should throw NotFoundException if Vote doesn't exist", () => {
      voteRepository.findOne.mockResolvedValue(null);
      const result = votesService.getVoteById(10);

      expect(voteRepository.findOne).toHaveBeenCalledWith({ where: { id: 10 } });
      expect(result).rejects.toThrow(NotFoundException);
    });
  });

  describe('getVotesCountByQuestionId', () => {
    it('Should return a Vote count by QuestionId', async () => {
      voteRepository.count.mockResolvedValue(3);
      const result = await votesService.getVotesCountByQuestionId(10);

      expect(voteRepository.count).toHaveBeenCalledWith({ where: { questionId: 10 } });
      expect(result).toEqual(3);
    });

    it('Should return a Vote count = 0 by QuestionId', async () => {
      voteRepository.count.mockResolvedValue(0);
      const result = await votesService.getVotesCountByQuestionId(10);

      expect(voteRepository.count).toHaveBeenCalledWith({ where: { questionId: 10 } });
      expect(result).toEqual(0);
    });
  });

  describe('getVotesCountByOptionId', () => {
    it('Should return a Vote count by OptionId', async () => {
      voteRepository.count.mockResolvedValue(3);
      const result = await votesService.getVotesCountByOptionId(10);

      expect(voteRepository.count).toHaveBeenCalledWith({ where: { optionId: 10 } });
      expect(result).toEqual(3);
    });

    it('Should return a Vote count = 0 by OptionId', async () => {
      voteRepository.count.mockResolvedValue(0);
      const result = await votesService.getVotesCountByOptionId(10);

      expect(voteRepository.count).toHaveBeenCalledWith({ where: { optionId: 10 } });
      expect(result).toEqual(0);
    });
  });

  describe('hasUserVotedAlready', () => {
    it('User has already voted', async () => {
      votesService.getUserVoteByQuestionId = jest.fn().mockResolvedValue(true);
      const result = await votesService.hasUserVotedAlready(10, mockUser);

      expect(votesService.getUserVoteByQuestionId).toHaveBeenCalledWith(10, mockUser);
      expect(result).toEqual(true);
    });

    it('User has not voted yet', async () => {
      votesService.getUserVoteByQuestionId = jest.fn().mockResolvedValue(false);
      const result = await votesService.hasUserVotedAlready(10, mockUser);

      expect(votesService.getUserVoteByQuestionId).toHaveBeenCalledWith(10, mockUser);
      expect(result).toEqual(false);
    });
  });

  describe('getUserVoteByQuestionId', () => {
    it('Successfully got Vote of User with UserId', async () => {
      mockUser.userId = 123;
      voteRepository.findOne.mockResolvedValue(mockVote);
      const result = await votesService.getUserVoteByQuestionId(10, mockUser);

      expect(voteRepository.findOne).toHaveBeenCalledWith({
        where: { questionId: 10, creatorId: 123 }
      });
      expect(result).toEqual(mockVote);
    });

    it('Successfully got Vote of User without UserId', async () => {
      mockUser.userId = undefined;
      voteRepository.findOne.mockResolvedValue(mockVote);
      const result = await votesService.getUserVoteByQuestionId(10, mockUser);

      expect(voteRepository.findOne).toHaveBeenCalledWith({
        where: { questionId: 10, creatorCookie: 'some string' }
      });
      expect(result).toEqual(mockVote);
    });

    it('Can not get Vote of User with UserId', async () => {
      mockUser.userId = 123;
      voteRepository.findOne.mockResolvedValue(null);
      const result = await votesService.getUserVoteByQuestionId(10, mockUser);

      expect(voteRepository.findOne).toHaveBeenCalledWith({
        where: { questionId: 10, creatorId: 123 }
      });
      expect(result).toEqual(null);
    });

    it('Can not get Vote of User without UserId', async () => {
      mockUser.userId = undefined;
      voteRepository.findOne.mockResolvedValue(null);
      const result = await votesService.getUserVoteByQuestionId(10, mockUser);

      expect(voteRepository.findOne).toHaveBeenCalledWith({
        where: { questionId: 10, creatorCookie: 'some string' }
      });
      expect(result).toEqual(null);
    });
  });

  describe('createVote', () => {
    const createVoteDto = new CreateVoteDto();
    createVoteDto.user = mockUser;

    it('Successfully create new Vote', async () => {
      optionsService.getOptionById.mockResolvedValue(mockOption);
      votesService.hasUserVotedAlready = jest.fn().mockResolvedValue(false);
      voteRepository.createVote.mockResolvedValue(mockVote);
      questionsService.getQuestionById.mockResolvedValue(mockQuestion);
      questionsService.completeQuestionToFull.mockResolvedValue({ mockQuestion });
      const result = await votesService.createVote(createVoteDto);

      expect(optionsService.getOptionById).toHaveBeenCalledWith(createVoteDto.optionId);
      expect(votesService.hasUserVotedAlready).toHaveBeenCalledWith(
        mockOption.questionId,
        createVoteDto.user
      );
      expect(voteRepository.createVote).toHaveBeenCalledWith(createVoteDto, mockOption);
      expect(questionsService.getQuestionById).toHaveBeenCalledWith(mockVote.questionId);
      expect(questionsService.completeQuestionToFull).toHaveBeenCalledWith(
        mockQuestion,
        true,
        QuestionState.RESULT
      );
      expect(result).toEqual({ mockQuestion });
    });

    it('Can not create new Vote, because user has already voted', async () => {
      optionsService.getOptionById.mockResolvedValue(mockOption);
      votesService.hasUserVotedAlready = jest.fn().mockResolvedValue(true);
      const result = votesService.createVote(createVoteDto);

      expect(optionsService.getOptionById).toHaveBeenCalledWith(createVoteDto.optionId);
      // expect(votesService.hasUserVotedAlready).toHaveBeenCalled();
      expect(voteRepository.createVote).not.toHaveBeenCalled();
      expect(questionsService.getQuestionById).not.toHaveBeenCalled();
      expect(questionsService.completeQuestionToFull).not.toHaveBeenCalled();
      expect(result).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteVote', () => {
    it('Delete a Vote and return Question', async () => {
      votesService.getVoteById = jest.fn().mockResolvedValue(mockVote);
      questionsService.getQuestionById.mockResolvedValue(mockQuestion);
      questionsService.completeQuestionToFull.mockResolvedValue({ mockQuestion });
      const result = await votesService.deleteVote(10);

      expect(votesService.getVoteById).toHaveBeenCalledWith(10);
      expect(voteRepository.remove).toHaveBeenCalledWith(mockVote);
      expect(questionsService.getQuestionById).toHaveBeenCalledWith(mockVote.questionId);
      expect(questionsService.completeQuestionToFull).toHaveBeenCalledWith(
        mockQuestion,
        false,
        QuestionState.VOTING
      );
      expect(result).toEqual({ mockQuestion });
    });

    // it('Can not find a Vote to delete', async () => {
    //   // votesService.getVoteById = jest.fn().mockRejectedValue(NotFoundException);
    //   // spyOn(votesService, 'getVoteById').and.returnValues(NotFoundException);
    //   spyOn(votesService, 'getVoteById').and.rejectedValue(NotFoundException);
    //
    //   const result = await votesService.deleteVote(10);
    //
    //   expect(votesService.getVoteById).toHaveBeenCalledWith(10);
    //   expect(result).rejects.toThrow(NotFoundException);
    //   // expect(voteRepository.remove).not.toHaveBeenCalled();
    //   // expect(questionsService.getQuestionById).not.toHaveBeenCalled();
    //   // expect(questionsService.completeQuestionToFull).not.toHaveBeenCalled();
    // });
  });
});
