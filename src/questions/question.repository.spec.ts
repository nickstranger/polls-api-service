import { Test } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';

import { Question } from './question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { QuestionRepository } from './question.repository';
import { Poll } from '../polls/poll.entity';

describe('QuestionsRepository', () => {
  let questionRepository: QuestionRepository;

  const mockPoll = new Poll();
  mockPoll.id = 1;

  const mockQuestion = new Question();
  mockQuestion.id = 1;
  mockQuestion.orderInPoll = 1;
  mockQuestion.text = 'question_text';

  const mockCreateQuestionDto = new CreateQuestionDto();
  mockCreateQuestionDto.order = 1;
  mockCreateQuestionDto.text = 'question_text';

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [QuestionRepository]
    }).compile();

    questionRepository = moduleRef.get<QuestionRepository>(QuestionRepository);
  });

  describe('createQuestion', () => {
    beforeEach(() => {
      questionRepository.create = jest.fn().mockResolvedValue(mockQuestion);
    });

    test('Successfully creates a new Question', async () => {
      spyOn(questionRepository, 'save').and.returnValue(mockQuestion);

      const result = await questionRepository.createQuestion(mockCreateQuestionDto, mockPoll);

      expect(questionRepository.create).toHaveBeenCalled();
      expect(questionRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockQuestion);
    });

    test('Failed on create a new Question', async () => {
      spyOn(questionRepository, 'save').and.throwError('error');

      const result = questionRepository.createQuestion(mockCreateQuestionDto, mockPoll);

      expect(questionRepository.create).toHaveBeenCalled();
      expect(questionRepository.save).toHaveBeenCalled();
      expect(result).rejects.toThrow(InternalServerErrorException);
    });
  });
});
