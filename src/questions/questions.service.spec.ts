import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { Question } from './question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionState } from './question.types';
import { QuestionsService } from './questions.service';
import { QuestionRepository } from './question.repository';
import { Option } from '../options/option.entity';
import { CreateOptionDto } from '../options/dto/create-option.dto';
import { OptionsService } from '../options/options.service';
import { Poll } from '../polls/poll.entity';
import { PollStatus } from '../polls/poll.types';
import { Vote } from '../votes/vote.entity';
import { VotesService } from '../votes/votes.service';
import { UserDto } from '../utils/user.dto';

describe('QuestionsService', () => {
  let questionsService: QuestionsService;
  let questionRepository: QuestionRepository;
  let optionsService: OptionsService;
  let votesService: VotesService;

  const mockQuestionRepository = () => ({
    findOne: jest.fn(),
    find: jest.fn(),
    createQuestion: jest.fn()
  });

  const mockOptionsService = () => ({
    getOptionsByQuestion: jest.fn(),
    createOptions: jest.fn()
  });

  const mockVotesService = () => ({
    getVotesCountByQuestionId: jest.fn(),
    getUserVoteByQuestionId: jest.fn(),
    hasUserVotedAlready: jest.fn()
  });

  const mockPoll = new Poll();
  mockPoll.id = 5;

  const mockQuestion = new Question();
  mockQuestion.id = 10;

  const mockOption = new Option();
  mockOption.id = 15;

  const mockVote = new Vote();
  mockVote.id = 2;

  const mockUser = new UserDto();
  mockUser.userCookie = 'some_string';
  mockUser.userId = 12345;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [
        QuestionsService,
        { provide: QuestionRepository, useFactory: mockQuestionRepository },
        { provide: OptionsService, useFactory: mockOptionsService },
        { provide: VotesService, useFactory: mockVotesService }
      ]
    }).compile();

    questionsService = moduleRef.get<QuestionsService>(QuestionsService);
    questionRepository = moduleRef.get<QuestionRepository>(QuestionRepository);
    optionsService = moduleRef.get<OptionsService>(OptionsService);
    votesService = moduleRef.get<VotesService>(VotesService);
  });

  describe('completeQuestionToFull', () => {
    const testData = [
      [
        QuestionState.RESULT,
        {
          ...mockQuestion,
          state: QuestionState.RESULT,
          options: [mockOption, mockOption, mockOption],
          optionsCount: 3,
          userVote: mockVote,
          votesCount: 5
        }
      ],
      [
        QuestionState.VOTING,
        {
          ...mockQuestion,
          state: QuestionState.VOTING,
          options: [mockOption, mockOption, mockOption],
          optionsCount: 3,
          userVote: null,
          votesCount: 5
        }
      ]
    ];
    test.each(testData)(
      'should return a full entity of questions',
      async (questionState: QuestionState, expected: Question) => {
        const mockOptionsWithResult = true;

        spyOn(optionsService, 'getOptionsByQuestion').and.returnValue(expected.options);
        spyOn(votesService, 'getVotesCountByQuestionId').and.returnValue(expected.votesCount);
        spyOn(votesService, 'getUserVoteByQuestionId').and.returnValue(expected.userVote);

        const result = await questionsService.completeQuestionToFull(
          mockQuestion,
          mockOptionsWithResult,
          questionState,
          mockUser
        );

        expect(optionsService.getOptionsByQuestion).toHaveBeenCalledWith(
          mockQuestion,
          mockOptionsWithResult
        );

        if (questionState === QuestionState.RESULT) {
          expect(votesService.getUserVoteByQuestionId).toHaveBeenCalledWith(
            mockQuestion.id,
            mockUser
          );
        }
        expect(votesService.getVotesCountByQuestionId).toHaveBeenCalledWith(mockQuestion.id);
        expect(result).toEqual(expected);
        expect(result.optionsCount).toEqual(3);
      }
    );
  });

  describe('getQuestionById', () => {
    test('Should return a Question by Id', async () => {
      spyOn(questionRepository, 'findOne').and.returnValue(mockQuestion);

      const result = await questionsService.getQuestionById(20);

      expect(questionRepository.findOne).toHaveBeenCalledWith({ where: { id: 20 } });
      expect(result).toEqual(mockQuestion);
    });

    test("Should throw NotFoundException in Question isn't exists", () => {
      spyOn(questionRepository, 'findOne').and.returnValue(null);

      const result = questionsService.getQuestionById(30);

      expect(questionRepository.findOne).toHaveBeenCalledWith({ where: { id: 30 } });
      expect(result).rejects.toThrow(NotFoundException);
    });
  });

  describe('getQuestionsByPoll', () => {
    const testData = [
      [PollStatus.ACTIVE, true, [{ id: 10, state: QuestionState.RESULT }]],
      [PollStatus.ACTIVE, false, [{ id: 10, state: QuestionState.VOTING }]],
      [PollStatus.INACTIVE, true, [{ id: 10, state: QuestionState.RESULT }]],
      [PollStatus.INACTIVE, false, [{ id: 10, state: QuestionState.RESULT }]]
    ];

    test.each(testData)(
      'Should return Questions by Poll',
      async (status: PollStatus, hasUserVotedAlready: boolean, expected: Question[]) => {
        spyOn(questionRepository, 'find').and.returnValue([mockQuestion]);
        spyOn(votesService, 'hasUserVotedAlready').and.returnValue(hasUserVotedAlready);
        spyOn(questionsService, 'completeQuestionToFull').and.returnValue({
          ...mockQuestion,
          state: expected[0].state
        });

        const result = await questionsService.getQuestionsByPoll(
          { ...mockPoll, status: status },
          mockUser
        );

        expect(questionRepository.find).toHaveBeenCalledWith({
          where: { pollId: mockPoll.id },
          order: { orderInPoll: 'ASC' }
        });
        expect(votesService.hasUserVotedAlready).toHaveBeenCalledWith(
          mockQuestion.id,
          mockUser
        );
        expect(questionsService.completeQuestionToFull).toHaveBeenCalledWith(
          mockQuestion,
          expected[0].state === QuestionState.RESULT,
          expected[0].state,
          mockUser
        );
        expect(result).toEqual(expected);
      }
    );

    test("Should throw NotFoundException in Questions aren't exists", () => {
      spyOn(questionRepository, 'find').and.returnValue([]);

      const result = questionsService.getQuestionsByPoll(mockPoll, mockUser);

      expect(questionRepository.find).toHaveBeenCalledWith({
        where: { pollId: mockPoll.id },
        order: { orderInPoll: 'ASC' }
      });
      expect(result).rejects.toThrow(NotFoundException);
    });
  });

  describe('createQuestions', () => {
    const createQuestionsDto = [new CreateQuestionDto()];
    createQuestionsDto[0].options = [new CreateOptionDto()];

    test('Successfully create new Questions', async () => {
      spyOn(optionsService, 'createOptions').and.returnValues([mockOption]);
      spyOn(questionRepository, 'createQuestion').and.returnValues(mockQuestion);

      const result = await questionsService.createQuestions(createQuestionsDto, mockPoll);

      await expect(questionRepository.createQuestion).resolves;
      await expect(questionsService.createQuestions).resolves;
      expect(result).toEqual([mockQuestion]);
    });
  });
});
