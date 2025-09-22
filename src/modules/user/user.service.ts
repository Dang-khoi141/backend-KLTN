import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { Users } from './entities/users.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { S3Service } from '../uploads/upload.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    private readonly s3Service: S3Service,
  ) {}
  async create(userDto: UserDto, file?: Express.Multer.File) {
    const checkemail = await this.userRepository.findOneBy({
      email: userDto.email,
    });
    if (checkemail) {
      throw new ConflictException('Email already in use');
    }

    const user = this.userRepository.create(userDto);
    user.password = await bcrypt.hash(user.password, 10);

    if (file) {
      const avatarUrl = await this.s3Service.uploadFile(file, 'users');
      user.avatar = avatarUrl;
    }

    return this.userRepository.save(user);
  }

  async findAll(): Promise<Users[]> {
    return this.userRepository.find();
  }
  async findOneById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }
  async update(id: string, userDto: Partial<UpdateUserDto>): Promise<Users> {
    const user = await this.findOneById(id);
    console.log('🚀 ~ UserService ~ update ~ user:', user);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    Object.assign(user, userDto);

    return await this.userRepository.save(user);
  }

  async updateAdmin(
    id: string,
    updateAdminUserDto: Partial<UpdateAdminUserDto>,
  ): Promise<Users> {
    const user = await this.findOneById(id);
    console.log('🚀 ~ UserService ~ updateAdmin ~ user:', user);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    Object.assign(user, updateAdminUserDto);

    return await this.userRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async findByEmail(email: string): Promise<Users | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async updatePassword(email: string, hashedPassword: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    user.password = hashedPassword;
    await this.userRepository.save(user);
  }
}
