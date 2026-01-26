import {
  IsUUID,
  IsBoolean,
  IsOptional,
  IsDateString,
  ValidateIf,
} from 'class-validator';

export class CreatePermissionDto {
  @IsUUID()
  folder_id: string;

  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !o.role_id)
  user_id?: string | null;

  @IsUUID()
  @IsOptional()
  @ValidateIf((o) => !o.user_id)
  role_id?: string | null;

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

