import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities';
import { CreateRoleDto } from './dto/create-role.dto';

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
    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new Error('Role not found');
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

