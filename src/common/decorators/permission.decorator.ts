import { SetMetadata } from '@nestjs/common';
import { PermissionType } from '../guards/folder-permission.guard';

export const RequirePermission = (permission: PermissionType) =>
  SetMetadata('permission', permission);

