import { IsString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateOptionDto {
  @IsNotEmpty()
  @IsInt()
  order: number;

  @IsNotEmpty()
  @IsString()
  text: string;
}
