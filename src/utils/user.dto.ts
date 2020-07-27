import { IsString, IsOptional, IsInt, IsIP } from 'class-validator';

export class UserDto {
  @IsOptional()
  @IsString()
  userCookie?: string;

  @IsOptional()
  @IsInt()
  userId?: number;

  @IsOptional()
  @IsIP()
  userIp?: string;

  @IsOptional()
  @IsString()
  userUA?: string;
}
