import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { Folder, FolderPermission } from '../entities';
import { FolderPermissionGuard } from '../common/guards/folder-permission.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Folder, FolderPermission])],
  controllers: [FoldersController],
  providers: [FoldersService, FolderPermissionGuard],
  exports: [FoldersService],
})
export class FoldersModule {}

