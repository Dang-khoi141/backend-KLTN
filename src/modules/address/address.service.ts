import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { Users } from '../user/entities/users.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
  ) {}

  async getAllAddresses(userId: string): Promise<Address[]> {
    return this.addressRepo.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', updatedAt: 'DESC' },
    });
  }

  async getDefaultAddress(userId: string): Promise<Address | null> {
    return this.addressRepo.findOne({
      where: { user: { id: userId }, isDefault: true },
    });
  }

  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.isDefault) {
      await this.addressRepo.update(
        { user: { id: userId }, isDefault: true },
        { isDefault: false },
      );
    }

    const address = this.addressRepo.create({
      ...dto,
      user: user,
    });
    return this.addressRepo.save(address);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.addressRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!address) throw new NotFoundException('Address not found');

    if (dto.isDefault) {
      await this.addressRepo.update(
        { user: { id: userId }, isDefault: true },
        { isDefault: false },
      );
    }

    Object.assign(address, dto);
    return this.addressRepo.save(address);
  }

  async delete(userId: string, id: string): Promise<void> {
    const address = await this.addressRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!address) throw new NotFoundException('Address not found');
    await this.addressRepo.remove(address);
  }

  async setDefault(userId: string, id: string): Promise<Address> {
    const address = await this.addressRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!address) throw new NotFoundException('Address not found');

    await this.addressRepo.update(
      { user: { id: userId }, isDefault: true },
      { isDefault: false },
    );

    address.isDefault = true;
    return this.addressRepo.save(address);
  }
}
