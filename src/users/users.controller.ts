import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import type { RequestWithUser } from '../common/interfaces/request-with-user.interface';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req: RequestWithUser) {
    return this.usersService.findOne(req.user.id);
  }

  @Get('role')
  async getRole(@Request() req: RequestWithUser) {
    const user = await this.usersService.findOne(req.user.id);
    return {
      role: user.role,
      role_id: user.role_id,
    };
  }

  @Get('my-roles')
  async getMyRoles(@Request() req: RequestWithUser) {
    return this.usersService.getUserRoles(req.user.id);
  }

  @Post('switch-role')
  async switchRole(
    @Request() req: RequestWithUser,
    @Body() body: { role_id: string },
  ) {
    const user = await this.usersService.findOne(req.user.id);
    // Just return the user and the requested role info
    // (the JWT token refresh would normally be handled by AuthService)
    return {
      user,
      active_role: user.role,
    };
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(
      paginationDto.page,
      paginationDto.limit,
    );
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('import-excel')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async importExcel(@Body() usersData: any[]) {
    return this.usersService.importExcel(usersData);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }

  // ========== Multi-Role Assignment ==========

  @Get(':id/roles')
  async getUserRoles(@Param('id') id: string) {
    return this.usersService.getUserRoles(id);
  }

  @Post(':id/roles')
  async assignRole(
    @Param('id') id: string,
    @Body() body: { role_id: string; is_primary?: boolean; expires_at?: string | null },
  ) {
    return this.usersService.assignRoleToUser(
      id,
      body.role_id,
      body.is_primary || false,
      body.expires_at || null,
    );
  }

  @Delete(':userId/roles/:roleId')
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    await this.usersService.removeRoleFromUser(userId, roleId);
    return { message: 'Role berhasil dihapus dari user' };
  }

  @Patch(':userId/roles/:roleId/set-primary')
  async setPrimaryRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.usersService.setPrimaryRole(userId, roleId);
  }
}
