import { ValidateNested, ArrayNotEmpty, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateQuestionDto } from '../../questions/dto/create-question.dto';
import { UserDto } from '../../utils/user.dto';

export class CreatePollDto {
  @ValidateNested()
  @IsDefined()
  @Type(() => UserDto)
  user: UserDto;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
