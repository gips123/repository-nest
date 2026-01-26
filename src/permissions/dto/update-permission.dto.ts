import { IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class UpdatePermissionDto {
  @IsBoolean()
  @IsOptional()
  can_read?: boolean;

  @IsBoolean()
  @IsOptional()
  can_create?: boolean;

  @IsBoolean()
  @IsOptional()
  can_update?: boolean;

  @IsBoolean()
  @IsOptional()
  can_delete?: boolean;

  @IsDateString()
  @IsOptional()
  expires_at?: string | null;
}

