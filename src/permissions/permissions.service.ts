import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FolderPermission, Folder, User, Role } from '../entities';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(FolderPermission)
    private permissionRepository: Repository<FolderPermission>,
    @InjectRepository(Folder)
    private folderRepository: Repository<Folder>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<FolderPermission> {
    // Validate that either user_id or role_id is provided, but not both
    if (!createPermissionDto.user_id && !createPermissionDto.role_id) {
      throw new BadRequestException(
        'Either user_id or role_id must be provided',
      );
    }

    if (createPermissionDto.user_id && createPermissionDto.role_id) {
      throw new BadRequestException(
        'Cannot assign permission to both user and role. Choose one.',
      );
    }

    // Validate folder exists
    const folder = await this.folderRepository.findOne({
      where: { id: createPermissionDto.folder_id },
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    // Validate user exists if provided
    if (createPermissionDto.user_id) {
      const user = await this.userRepository.findOne({
        where: { id: createPermissionDto.user_id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
    }

    // Validate role exists if provided
    if (createPermissionDto.role_id) {
      const role = await this.roleRepository.findOne({
        where: { id: createPermissionDto.role_id },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }
    }

    // Check if permission already exists
    const whereClause: any = {
      folder_id: createPermissionDto.folder_id,
    };
    
    if (createPermissionDto.user_id) {
      whereClause.user_id = createPermissionDto.user_id;
    } else {
      whereClause.user_id = null;
    }
    
    if (createPermissionDto.role_id) {
      whereClause.role_id = createPermissionDto.role_id;
    } else {
      whereClause.role_id = null;
    }

    const existing = await this.permissionRepository.findOne({
      where: whereClause,
    });

    if (existing) {
      throw new BadRequestException('Permission already exists');
    }

    const permission = this.permissionRepository.create({
      ...createPermissionDto,
      expires_at: createPermissionDto.expires_at
        ? new Date(createPermissionDto.expires_at)
        : null,
    });

    return this.permissionRepository.save(permission);
  }

  async findAll(folderId?: string): Promise<FolderPermission[]> {
    const where: any = {};
    if (folderId) {
      where.folder_id = folderId;
    }

    return this.permissionRepository.find({
      where,
      relations: ['folder', 'user', 'role'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<FolderPermission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['folder', 'user', 'role'],
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<FolderPermission> {
    const permission = await this.findOne(id);

    Object.assign(permission, {
      ...updatePermissionDto,
      expires_at: updatePermissionDto.expires_at
        ? new Date(updatePermissionDto.expires_at)
        : permission.expires_at,
    });

    return this.permissionRepository.save(permission);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.permissionRepository.remove(permission);
  }
}

