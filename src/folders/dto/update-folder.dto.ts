import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateFolderDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;
}

