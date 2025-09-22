import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class UpdateAdminUserDto {
  @ApiProperty({ example: 'John Doe', description: 'User Name' })
  @IsString({ message: 'Name is not valid' })
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @Length(10, 11, { message: 'Phone must be 10-11 digits' })
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: UserRole, default: UserRole.CUSTOMER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ example: 'https://.../avatar.png', description: 'Avatar URL' })
  @IsString()
  @IsOptional()
  avatar?: string;
}
