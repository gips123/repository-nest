import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { File, Folder } from '../entities';
import { FoldersModule } from '../folders/folders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, Folder]),
    FoldersModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}

