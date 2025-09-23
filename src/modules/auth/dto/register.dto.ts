import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumberString,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class registerDTO {
  @ApiProperty({ example: 'John Doe', description: 'User Name' })
  @IsString({ message: 'Name is not valid' })
  name: string;

  @ApiProperty({ example: 'user@example.com', description: 'Email' })
  @IsEmail({}, { message: 'Email is not valid' })
  email: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Password (Minimum 6 characters)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({
    example: '0912345678',
    description: 'Phone number (10-11 digits)',
  })
  @IsNumberString({}, { message: 'Phone must contain only digits' })
  @Length(10, 11, { message: 'Phone must be 10-11 digits' })
  phone: string;

  @ApiProperty({ example: '123456', description: 'OTP code (6 digits)' })
  @IsNumberString({}, { message: 'OTP must contain only digits' })
  @Length(6, 6, { message: 'OTP must be 6 digits' })
  otp: string;
}
