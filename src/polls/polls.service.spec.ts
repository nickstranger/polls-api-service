import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { PollsService } from './polls.service';
import { Poll } from './poll.entity';
import { PollRepository } from './poll.repository';
import { QuestionsService } from '../questions/questions.service';
import { PollStatus } from './poll.types';
import { UserDto } from '../utils/user.dto';
import { Question } from '../questions/question.entity';
import { CreatePollDto } from './dto/create-poll.dto';
import { CreateQuestionDto } from '../questions/dto/create-question.dto';

describe('PollsService', () => {
  let pollsService: PollsService;
  let pollRepository;
  let questionsService;

  const mockPollRepository = () => ({
    findOne: jest.fn(),
    createPoll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  });

  const mockQuestionsService = () => ({
    getQuestionsByPoll: jest.fn(),
    createQuestions: jest.fn()
  });

  const mockPoll = new Poll();
  mockPoll.id = 10;

  const mockQuestion = new Question();
  mockQuestion.id = 34;

  const mockUser = new UserDto();
  mockUser.userCookie = 'some string';
  mockUser.userId = 123;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PollsService,
        { provide: PollRepository, useFactory: mockPollRepository },
        { provide: QuestionsService, useFactory: mockQuestionsService }
      ]
    }).compile();

    pollsService = await module.get<PollsService>(PollsService);
    pollRepository = await module.get<PollRepository>(PollRepository);
    questionsService = await module.get<QuestionsService>(QuestionsService);
  });

  describe('getPollById', () => {
    it('Should return a Pool by Id', async () => {
      pollRepository.findOne.mockResolvedValue(mockPoll);

      spyOn(questionsService, 'getQuestionsByPoll').and.returnValue([mockQuestion, mockQuestion]);

      const result = await pollsService.getPollById(10, mockUser);
      expect(pollRepository.findOne).toHaveBeenCalledWith({ where: { id: 10 } });
      expect(questionsService.getQuestionsByPoll).toHaveBeenCalledWith(result, mockUser);
      expect(result).toEqual(mockPoll);
      expect(result.questionsCount).toEqual(2);
    });

    it("Should throw NotFoundException in Poll isn't exists", () => {
      pollRepository.findOne.mockResolvedValue(null);
      const result = pollsService.getPollById(10, mockUser);
      expect(pollRepository.findOne).toHaveBeenCalledWith({ where: { id: 10 } });
      expect(result).rejects.toThrow(NotFoundException);
      expect(questionsService.getQuestionsByPoll).not.toHaveBeenCalled();
    });
  });

  describe('createPoll', () => {
    const createPollDto = new CreatePollDto();
    const createQuestionDto = new CreateQuestionDto();
    createQuestionDto.text = 'some text';
    createQuestionDto.order = 1;
    createPollDto.user = mockUser;
    createPollDto.questions = [createQuestionDto];

    it('Successfully create new poll', async () => {
      spyOn(questionsService, 'createQuestions').and.returnValues([mockQuestion]);

      pollRepository.createPoll.mockResolvedValue(mockPoll);
      const result = await pollsService.createPoll(createPollDto);
      expect(pollRepository.createPoll).toHaveBeenCalledWith(createPollDto);
      expect(questionsService.createQuestions).toHaveBeenCalledWith(
        createPollDto.questions,
        result
      );
      expect(result).toEqual(mockPoll);
    });
  });

  describe('deletePoll', () => {
    it('Should delete a Poll', async () => {
      const result = await pollsService.deletePoll(10);
      expect(pollRepository.delete).toHaveBeenCalledWith({ id: 10 });
    });

    it("Shouldn't find a Poll to delete", () => {
      spyOn(pollRepository, 'delete').and.returnValue({ affected: 0 });
      const result = pollsService.deletePoll(10);
      expect(pollRepository.delete).toHaveBeenCalledWith({ id: 10 });
      expect(result).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivatePoll', () => {
    it('Should deactivate a Poll', async () => {
      const result = await pollsService.deactivatePoll(10);
      expect(pollRepository.update).toHaveBeenCalledWith(10, { status: PollStatus.INACTIVE });
    });

    it("Shouldn't find a Poll to deactivate", () => {
      spyOn(pollRepository, 'update').and.returnValue({ affected: 0 });
      const result = pollsService.deactivatePoll(10);
      expect(pollRepository.update).toHaveBeenCalledWith(10, { status: PollStatus.INACTIVE });
      expect(result).rejects.toThrow(NotFoundException);
    });
  });
});
