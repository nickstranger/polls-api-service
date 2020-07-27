import { Test } from '@nestjs/testing';

import { PollRepository } from './poll.repository';
import { Poll } from './poll.entity';
import { PollStatus } from './poll.types';
import { CreatePollDto } from './dto/create-poll.dto';
import { UserDto } from '../utils/user.dto';
import { InternalServerErrorException } from '@nestjs/common';

describe('PollRepository', () => {
  let pollRepository: PollRepository;

  const mockPoll = new Poll();
  mockPoll.id = 1;
  mockPoll.status = PollStatus.ACTIVE;
  mockPoll.creatorIp = '1.1.1.1';
  mockPoll.creatorUserAgent = 'user agent';
  mockPoll.creatorCookie = 'some string';
  mockPoll.creatorId = 123;

  const mockCreatePollDto = new CreatePollDto();
  mockCreatePollDto.user = new UserDto();
  mockCreatePollDto.user.userCookie = 'some string';
  mockCreatePollDto.user.userId = 123;
  mockCreatePollDto.user.userIp = '1.1.1.1';
  mockCreatePollDto.user.userUA = 'user agent';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PollRepository]
    }).compile();

    pollRepository = await module.get<PollRepository>(PollRepository);
  });

  describe('createPoll', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      pollRepository.create = jest.fn().mockResolvedValue({ save });
    });

    it('Successfully creates a new Poll', async () => {
      spyOn(pollRepository, 'save').and.returnValue(mockPoll);
      const result = await pollRepository.createPoll(mockCreatePollDto);
      expect(pollRepository.create).toHaveBeenCalled();
      expect(pollRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockPoll);
    });

    it('failed on creates a new Poll', async () => {
      spyOn(pollRepository, 'save').and.throwError('error');
      const result = pollRepository.createPoll(mockCreatePollDto);
      expect(pollRepository.create).toHaveBeenCalled();
      expect(pollRepository.save).toHaveBeenCalled();
      expect(result).rejects.toThrow(InternalServerErrorException);
    });
  });
});
