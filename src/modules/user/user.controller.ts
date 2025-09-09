import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { Users } from './entities/users.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UserRole } from './enums/user-role.enum';
import { Roles } from '../common/decorator/roles.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@Controller({
  path: 'users',
  version: '1',
})
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.SUPERADMIN)
  async create(@Body() createUserDto: UserDto): Promise<Users> {
    return this.userService.create(createUserDto);
  }
  @Get('')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async getFindAll(): Promise<Users[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async findOne(@Param('id') id: string): Promise<Users> {
    const Usersid = await this.userService.findOneById(id);
    if (!Usersid) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return Usersid;
  }

  @Patch(':id')
  @Roles(UserRole.SUPERADMIN)
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
  ): Promise<Users> {
    return this.userService.update(id, updateAdminUserDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.AGENT, UserRole.CUSTOMER)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Users> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN)
  async delete(@Param('id') id: string): Promise<void> {
    return this.userService.delete(id);
  }

  @Get('email/:email')
  async findByEmail(@Param('email') email: string): Promise<Users> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }
}
