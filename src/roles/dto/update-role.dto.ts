import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @MaxLength(50)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  description?: string;
}
