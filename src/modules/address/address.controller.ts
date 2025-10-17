import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { AddressService } from './address.service';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/enums/user-role.enum';

@Controller('addresses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  @Roles(UserRole.CUSTOMER)
  @ResponseMessage('Addresses retrieved successfully')
  getMyAddresses(@CurrentUser('userId') userId: string) {
    return this.addressService.getAllAddresses(userId);
  }

  @Get('default')
  @Roles(UserRole.CUSTOMER)
  @ResponseMessage('Default address retrieved successfully')
  getDefault(@CurrentUser('userId') userId: string) {
    return this.addressService.getDefaultAddress(userId);
  }

  @Post()
  @Roles(UserRole.CUSTOMER)
  @ResponseMessage('Address created successfully')
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateAddressDto) {
    return this.addressService.create(userId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.CUSTOMER)
  @ResponseMessage('Address updated successfully')
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.addressService.update(userId, id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.CUSTOMER)
  @ResponseMessage('Address deleted successfully')
  delete(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.addressService.delete(userId, id);
  }

  @Patch(':id/default')
  @Roles(UserRole.CUSTOMER)
  @ResponseMessage('Default address updated successfully')
  setDefault(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.addressService.setDefault(userId, id);
  }
}
