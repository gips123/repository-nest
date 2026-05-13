import { IsString, IsUUID, IsOptional, MinLength, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class RoleShareDto {
  @IsUUID()
  role_id: string;

  @IsBoolean()
  @IsOptional()
  can_download?: boolean;
}

export class CreateFolderDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsUUID()
  @IsOptional()
  parent_id?: string | null;

  // Legacy: role names as strings (backward compatibility)
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  share_with_roles?: string[];

  // New: role IDs with per-role can_download permission
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoleShareDto)
  @IsOptional()
  role_shares?: RoleShareDto[];

  @IsArray()
  @IsOptional()
  user_permissions?: any[];
}

