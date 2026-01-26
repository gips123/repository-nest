import { IsEmail, IsString, MinLength, IsUUID, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsUUID()
  @IsOptional()
  role_id?: string;
}

