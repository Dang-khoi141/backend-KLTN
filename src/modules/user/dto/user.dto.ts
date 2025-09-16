import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { UserRole } from '../enums/user-role.enum';

export class UserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'User Name',
  })
  @IsString({ message: 'Name is not valid' })
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email',
  })
  @IsEmail({})
  email: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Password (Minimum 6 characters)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password (Minimum 6 characters)' })
  password: string;

  @IsString()
  @Length(10, 11, { message: 'Phone must be 10-11 digits' })
  phone: string;

  @ApiProperty({ enum: UserRole, default: UserRole.CUSTOMER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
