import { IsInt, ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

import { UserDto } from '../../utils/user.dto';

export class CreateVoteDto {
  @IsInt()
  optionId: number;

  @ValidateNested()
  @IsDefined()
  @Type(() => UserDto)
  user: UserDto;
}
