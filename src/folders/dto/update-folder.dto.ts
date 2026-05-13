import { IsString, IsOptional, MinLength, IsArray, ValidateNested, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRoleShareDto {
  @IsUUID()
  role_id: string;

  @IsBoolean()
  @IsOptional()
  can_download?: boolean;
}

export class UpdateFolderDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  name?: string;

  // Legacy: role names as strings (backward compatibility)
  @IsArray()
  @IsOptional()
  share_with_roles?: string[];

  // New: role IDs with per-role can_download permission
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRoleShareDto)
  @IsOptional()
  role_shares?: UpdateRoleShareDto[];

  @IsArray()
  @IsOptional()
  user_permissions?: any[];
}
