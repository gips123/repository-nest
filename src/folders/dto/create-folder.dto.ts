import { IsString, IsUUID, IsOptional, MinLength } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsUUID()
  @IsOptional()
  parent_id?: string | null;
}

