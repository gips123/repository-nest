import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

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

  @Patch(':id')
  async updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  async removeRole(@Param('id') id: string) {
    await this.rolesService.remove(id);
    return { success: true, message: 'Role berhasil dihapus' };
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
  async updateDepth(@Body() body: { roleIds: string[]; maxDepth: number }) {
    await this.rolesService.updateRoleDepth(body.roleIds, body.maxDepth);
    return {
      success: true,
      message: `Max depth updated for ${body.roleIds.length} roles`,
    };
  }
}
