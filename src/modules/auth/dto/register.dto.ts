import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString, MinLength } from 'class-validator';

export class registerDTO {
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

  @IsNumber()
  phone: number;
}
