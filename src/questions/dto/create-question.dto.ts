import { IsString, IsInt, IsNotEmpty, ValidateNested, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateOptionDto } from '../../options/dto/create-option.dto';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsInt()
  order: number;

  @IsNotEmpty()
  @IsString()
  text: string;

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];
}
