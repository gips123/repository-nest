import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Role, UserRole } from '../entities';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FoldersService } from '../folders/folders.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @Inject(forwardRef(() => FoldersService))
    private foldersService: FoldersService,
  ) { }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role', 'roles', 'roles.role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['role', 'roles', 'roles.role'],
    });
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [users, total] = await this.userRepository.findAndCount({
      relations: ['role', 'roles', 'roles.role'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    let unit = 'general';
    if (createUserDto.role_id) {
      const role = await this.roleRepository.findOne({ where: { id: createUserDto.role_id } });
      if (role) {
        unit = role.name.toLowerCase().substring(0, 50);
      }
    }

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      unit: unit,
    });

    const savedUser = await this.userRepository.save(user);
    const userWithRole = await this.findOne(savedUser.id);

    return userWithRole;
  }

  async importExcel(usersData: any[]): Promise<{ success: number; failed: number; errors: any[] }> {
    let success = 0;
    let failed = 0;
    const errors: any[] = [];

    // Assuming we have basic string roles to matching role_ids
    const roles = await this.roleRepository.find();

    // Process sequentially to handle conflicts and hashes properly
    for (const data of usersData) {
      if (!data.name || !data.email) {
        failed++;
        errors.push({ email: data.email || 'Unknown', error: 'Missing name or email' });
        continue;
      }

      try {
        const existingUser = await this.findByEmail(data.email);
        if (existingUser) {
          failed++;
          errors.push({ email: data.email, error: 'User already exists' });
          continue;
        }

        const role = roles.find(r => r.name === (data.role || '').toLowerCase()) || roles.find(r => r.name === 'tendik');

        await this.create({
          email: data.email,
          name: data.name,
          password: data.password || 'password123', // Default password
          role_id: role ? role.id : undefined,
        });

        success++;
      } catch (err) {
        failed++;
        errors.push({ email: data.email, error: err.message });
      }
    }

    return { success, failed, errors };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Handle role_id change: load the new Role entity
    // so TypeORM properly updates the relation
    if (updateUserDto.role_id && updateUserDto.role_id !== user.role_id) {
      const newRole = await this.roleRepository.findOne({
        where: { id: updateUserDto.role_id },
      });

      if (!newRole) {
        throw new NotFoundException(`Role with id ${updateUserDto.role_id} not found`);
      }

      user.role = newRole;
      user.role_id = updateUserDto.role_id;
      user.unit = newRole.name.toLowerCase().substring(0, 50);
    }

    // Apply remaining fields (name, password, etc.)
    const { role_id, ...otherFields } = updateUserDto;
    Object.assign(user, otherFields);

    await this.userRepository.save(user);

    // Re-fetch to return consistent data with role relation
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    // Also clean up user_roles entries
    await this.userRoleRepository.delete({ user_id: id });
    await this.userRepository.remove(user);
  }

  // ========== Multi-Role Assignment ==========

  /**
   * Get all roles assigned to a user (from user_roles table).
   * Includes the user's default role (from user.role_id) as is_primary.
   */
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const user = await this.findOne(userId);

    const additionalRoles = await this.userRoleRepository.find({
      where: { user_id: userId },
      relations: ['role'],
      order: { assigned_at: 'ASC' },
    });

    // If no records in user_roles, return the default role as primary
    const hasPrimaryInTable = additionalRoles.some(ur => ur.is_primary);

    if (!hasPrimaryInTable && user.role) {
      // Create a virtual entry for the default role
      const primaryEntry = this.userRoleRepository.create({
        id: `default-${user.id}`,
        user_id: user.id,
        role_id: user.role_id,
        role: user.role,
        is_primary: true,
        assigned_at: user.created_at,
        expires_at: null,
      });

      return [primaryEntry, ...additionalRoles];
    }

    return additionalRoles;
  }

  /**
   * Assign an additional role to a user.
   */
  async assignRoleToUser(
    userId: string,
    roleId: string,
    isPrimary: boolean = false,
    expiresAt: string | null = null,
  ): Promise<UserRole> {
    const user = await this.findOne(userId);

    // Validate role exists
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Prevent duplicate assignment
    const existing = await this.userRoleRepository.findOne({
      where: { user_id: userId, role_id: roleId },
    });
    if (existing) {
      throw new ConflictException('User sudah memiliki role ini');
    }

    // Also check if this is the user's default role
    if (user.role_id === roleId) {
      throw new ConflictException('Role ini sudah menjadi default role user');
    }

    // If setting as primary, unset other primaries
    if (isPrimary) {
      await this.userRoleRepository.update(
        { user_id: userId, is_primary: true },
        { is_primary: false },
      );
      // Also update the user's default role_id
      user.role_id = roleId;
      user.role = role;
      user.unit = role.name.toLowerCase().substring(0, 50);
      await this.userRepository.save(user);
    }

    const userRole = this.userRoleRepository.create({
      user_id: userId,
      role_id: roleId,
      is_primary: isPrimary,
      expires_at: expiresAt ? new Date(expiresAt) : null,
    });

    const saved = await this.userRoleRepository.save(userRole);

    // Re-fetch with role relation to ensure response includes full role object
    const result = await this.userRoleRepository.findOne({
      where: { id: saved.id },
      relations: ['role'],
    });

    return result!;
  }

  /**
   * Remove an additional role from a user.
   * Cannot remove the user's default/primary role.
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    const user = await this.findOne(userId);

    // Cannot remove the user's default role
    if (user.role_id === roleId) {
      throw new ForbiddenException(
        'Tidak dapat menghapus default role user. Ubah default role terlebih dahulu.',
      );
    }

    const userRole = await this.userRoleRepository.findOne({
      where: { user_id: userId, role_id: roleId },
    });

    if (!userRole) {
      throw new NotFoundException('User tidak memiliki role ini sebagai additional role');
    }

    await this.userRoleRepository.remove(userRole);
  }

  /**
   * Set a specific role as the primary role for a user.
   */
  async setPrimaryRole(userId: string, roleId: string): Promise<UserRole> {
    const user = await this.findOne(userId);

    // Validate role exists
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Update the user's default role_id
    user.role_id = roleId;
    user.role = role;
    user.unit = role.name.toLowerCase().substring(0, 50);
    await this.userRepository.save(user);

    // Unset all primaries, then set the new one
    await this.userRoleRepository.update(
      { user_id: userId, is_primary: true },
      { is_primary: false },
    );

    let userRole = await this.userRoleRepository.findOne({
      where: { user_id: userId, role_id: roleId },
    });

    if (userRole) {
      userRole.is_primary = true;
      return await this.userRoleRepository.save(userRole);
    }

    // If the role wasn't in user_roles yet, create it as primary
    userRole = this.userRoleRepository.create({
      user_id: userId,
      role_id: roleId,
      is_primary: true,
    });

    return await this.userRoleRepository.save(userRole);
  }
}
