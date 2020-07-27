import { Test } from '@nestjs/testing';

import { CreateVoteDto } from './dto/create-vote.dto';
import { Vote } from './vote.entity';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { Question } from '../questions/question.entity';
import { QuestionState } from '../questions/question.types';

describe('VotesController', () => {
  let votesController: VotesController;
  let votesService;

  const mockVotesService = () => ({
    getVoteById: jest.fn(),
    createVote: jest.fn(),
    deleteVote: jest.fn()
  });

  const mockVote = new Vote();
  mockVote.id = 10;
  mockVote.creatorCookie = 'some string';
  mockVote.creatorId = 123;
  mockVote.creatorIp = '1.1.1.1';
  mockVote.creatorUserAgent = 'user agent';
  mockVote.questionId = 789;

  const mockQuestion = new Question();

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [VotesController],
      providers: [{ provide: VotesService, useFactory: mockVotesService }]
    }).compile();

    votesController = await module.get<VotesController>(VotesController);
    votesService = await module.get<VotesService>(VotesService);
  });

  describe('getVoteById', () => {
    it('Should call voteService.getVoteById and returns a Vote', async () => {
      votesService.getVoteById.mockResolvedValue(mockVote);
      const result = await votesController.getVoteById(10);

      expect(votesService.getVoteById).toHaveBeenLastCalledWith(10);
      expect(result).toEqual(mockVote);
    });
  });

  describe('createVote', () => {
    const mockCreateVoteDto = new CreateVoteDto();
    mockCreateVoteDto.user = { userCookie: 'some string', userId: 1231 };

    it('Should creates new Vote', async () => {
      const mockAnswer = { question: mockQuestion, fieldsToAdd: { state: QuestionState.RESULT } };
      votesService.createVote.mockResolvedValue(mockAnswer);
      const result = await votesController.createVote(mockCreateVoteDto);

      expect(votesService.createVote).toHaveBeenLastCalledWith(mockCreateVoteDto);
      expect(result).toEqual(mockAnswer);
    });
  });

  describe('deleteVote', () => {
    it('Should delete a Vote', async () => {
      const mockAnswer = { question: mockQuestion, fieldsToAdd: { state: QuestionState.VOTING } };
      votesService.deleteVote.mockResolvedValue(mockAnswer);
      const result = await votesController.deleteVote(10);

      expect(votesService.deleteVote).toHaveBeenCalledWith(10);
      expect(result).toEqual(mockAnswer);
    });
  });
});
