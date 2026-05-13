import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, User } from '../entities';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({
      order: { name: 'ASC' },
    });
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Validasi duplicate role name
    const existing = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });
    if (existing) {
      throw new ConflictException('Role dengan nama tersebut sudah ada');
    }

    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // Validasi duplicate role name jika nama diubah
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existing = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });
      if (existing) {
        throw new ConflictException('Role dengan nama tersebut sudah ada');
      }
    }

    Object.assign(role, updateRoleDto);
    return await this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    // Prevent delete for Super Admin and System Roles
    const protectedRoles = ['super admin', 'superadmin', 'admin'];
    if (protectedRoles.includes(role.name.toLowerCase().trim())) {
      throw new ForbiddenException(
        'Tidak dapat menghapus role system / admin',
      );
    }

    // Validasi jika masih digunakan user sebagai default role
    const userRepo = this.roleRepository.manager.getRepository(User);
    const usersCount = await userRepo.count({ where: { role_id: id } });
    if (usersCount > 0) {
      throw new ConflictException(
        `Role ini masih digunakan oleh ${usersCount} user sebagai default role, tidak dapat dihapus`,
      );
    }

    await this.roleRepository.remove(role);
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
    });
  }

  async updateRoleDepth(roleIds: string[], maxDepth: number): Promise<void> {
    if (roleIds.length === 0) return;
    await this.roleRepository.update(roleIds, { max_folder_depth: maxDepth });
  }

  /**
   * Returns all roles that can be used for Group Role Sharing.
   * Excludes Super Admin and system/internal roles.
   */
  async findSharable(): Promise<Pick<Role, 'id' | 'name'>[]> {
    const roles = await this.roleRepository.find({
      order: { name: 'ASC' },
    });

    // Exclude Super Admin and system/internal roles
    const excludedNames = ['super admin', 'superadmin', 'admin'];

    return roles
      .filter(role => {
        const norm = role.name.toLowerCase().trim();
        return !excludedNames.includes(norm);
      })
      .map(role => ({ id: role.id, name: role.name }));
  }
}
