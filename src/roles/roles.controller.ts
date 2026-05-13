import { Controller, Get, UseGuards, Patch, Body, Post } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateRoleDto } from './dto/create-role.dto';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  /**
   * Returns roles available for Group Role Sharing.
   * Excludes Super Admin and system/internal roles.
   */
  @Get('sharable')
  async findSharable() {
    return this.rolesService.findSharable();
  }

  @Patch('depth')
  async updateDepth(@Body() body: { roleIds: string[], maxDepth: number }) {
    await this.rolesService.updateRoleDepth(body.roleIds, body.maxDepth);
    return { success: true, message: `Max depth updated for ${body.roleIds.length} roles` };
  }
}

