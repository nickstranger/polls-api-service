import { Test } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';

import { CreateVoteDto } from './dto/create-vote.dto';
import { VoteRepository } from './vote.repository';
import { Vote } from './vote.entity';
import { Option } from '../options/option.entity';
import { UserDto } from '../utils/user.dto';

describe('VoteRepository', () => {
  let voteRepository: VoteRepository;

  const mockCreateVoteDto = new CreateVoteDto();
  mockCreateVoteDto.user = new UserDto();
  mockCreateVoteDto.user.userCookie = 'some string';
  mockCreateVoteDto.user.userId = 123;
  mockCreateVoteDto.user.userIp = '1.1.1.1';
  mockCreateVoteDto.user.userUA = 'user agent';

  const mockOption = new Option();
  mockOption.questionId = 789;

  const mockVoteToReturn = new Vote();
  mockVoteToReturn.id = 10;
  mockVoteToReturn.creatorCookie = 'some string';
  mockVoteToReturn.creatorId = 123;
  mockVoteToReturn.creatorIp = '1.1.1.1';
  mockVoteToReturn.creatorUserAgent = 'user agent';
  mockVoteToReturn.questionId = 789;

  const mockVoteToSave = Object.assign({}, mockVoteToReturn);
  mockVoteToSave.option = mockOption;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [VoteRepository]
    }).compile();

    voteRepository = await module.get<VoteRepository>(VoteRepository);
  });

  describe('createVote', () => {
    beforeEach(() => {
      voteRepository.create = jest.fn().mockReturnValue(mockVoteToSave);
    });

    it('Successfully creates a new Vote', async () => {
      spyOn(voteRepository, 'save');
      const result = await voteRepository.createVote(mockCreateVoteDto, mockOption);

      expect(voteRepository.create).toHaveBeenCalled();
      expect(voteRepository.save).toHaveBeenCalledWith(mockVoteToSave);
      expect(result).toEqual(mockVoteToReturn);
    });

    it('Failed on creates a new Vote', async () => {
      spyOn(voteRepository, 'save').and.throwError('error');
      const result = voteRepository.createVote(mockCreateVoteDto, mockOption);

      expect(voteRepository.create).toHaveBeenCalled();
      expect(voteRepository.save).toHaveBeenCalledWith(mockVoteToSave);
      expect(result).rejects.toThrow(InternalServerErrorException);
    });
  });
});
