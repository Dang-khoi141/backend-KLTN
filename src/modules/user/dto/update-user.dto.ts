import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @ApiProperty({
    example: 'John Doe',
    description: 'User Name',
  })
  @IsOptional()
  @IsString({ message: 'Name is not valid' })
  name: string;

  @IsOptional()
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email',
  })
  @IsEmail({})
  email: string;

  @IsString()
  @IsOptional()
  @Length(10, 11, { message: 'Phone must be 10-11 digits' })
  phone: string;

  @ApiProperty({ example: 'https://.../avatar.png', description: 'Avatar URL' })
  @IsString()
  @IsOptional()
  avatar?: string;
}
