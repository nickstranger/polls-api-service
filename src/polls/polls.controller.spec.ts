import { Test } from '@nestjs/testing';

import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { Poll } from './poll.entity';
import { CreatePollDto } from './dto/create-poll.dto';
import { UserDto } from '../utils/user.dto';
import { CreateQuestionDto } from '../questions/dto/create-question.dto';

describe('PollsController', () => {
  let pollsController: PollsController;
  let pollsService;

  const mockPollsService = () => ({
    getPollById: jest.fn(),
    createPoll: jest.fn(),
    deactivatePoll: jest.fn(),
    deletePoll: jest.fn()
  });

  const mockPoll = new Poll();
  mockPoll.id = 1;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [PollsController],
      providers: [{ provide: PollsService, useFactory: mockPollsService }]
    }).compile();

    pollsController = await module.get<PollsController>(PollsController);
    pollsService = await module.get<PollsService>(PollsService);
  });

  describe('getPollById', () => {
    const mockUser = new UserDto();
    mockUser.userCookie = 'some string';
    mockUser.userId = 123;

    it('Should call pollService.getPollById and returns a Poll', async () => {
      pollsService.getPollById.mockResolvedValue(mockPoll);
      const result = await pollsController.getPollById(10, mockUser);
      expect(pollsService.getPollById).toHaveBeenLastCalledWith(10, mockUser);
      expect(result).toEqual(mockPoll);
    });
  });

  describe('createPoll', () => {
    const mockCreatePollDto = new CreatePollDto();
    mockCreatePollDto.user = { userCookie: 'some string', userId: 1231 };
    mockCreatePollDto.questions = [new CreateQuestionDto()];

    it('Should creates new Poll', async () => {
      pollsService.createPoll.mockResolvedValue(mockPoll);
      const result = await pollsController.createPoll(mockCreatePollDto);
      expect(pollsService.createPoll).toHaveBeenLastCalledWith(mockCreatePollDto);
      expect(result).toEqual(mockPoll);
    });
  });

  describe('deactivatePoll', () => {
    it('Should deactivate a Poll', async () => {
      const result = await pollsController.deactivatePoll(10);
      expect(pollsService.deactivatePoll).toHaveBeenCalledWith(10);
    });
  });

  describe('deletePoll', () => {
    it('Should delete a Poll', async () => {
      const result = await pollsController.deletePoll(10);
      expect(pollsService.deletePoll).toHaveBeenCalledWith(10);
    });
  });
});
