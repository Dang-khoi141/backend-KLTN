/*eslint-disable */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { IJwtPayload } from '../common/interfaces/jwt-payload.interface';
import { loginDTO } from './dto/login.dto';
import { registerDTO } from './dto/register.dto';
import { UserService } from '../user/user.service';
import { Users } from '../user/entities/users.entity';
import { UserRole } from '../user/enums/user-role.enum';
import { UserDto } from '../user/dto/user.dto';
import { OtpService } from './otp/otp.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpService: OtpService,
  ) {}

  async validateUser(email: string, password: string): Promise<Users> {
    const user = await this.userService.findByEmail(email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(dto: loginDTO) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException();
    }
    const isMatch: boolean = await bcrypt.compare(dto.password, user.password);
    if (isMatch) {
      return this.generateTokens(user);
    } else {
      throw new UnauthorizedException();
    }
  }

  public generateTokens(user: Users) {
    const payload: IJwtPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'refresh_secret_key',
      expiresIn:
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  public refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<IJwtPayload>(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'refresh_secret_key',
      });

      const newAccessToken = this.jwtService.sign(
        {
          id: payload.id,
          email: payload.email,
          role: payload.role,
          name: payload.name,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
        },
      );

      const newRefreshToken = this.jwtService.sign(payload, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ||
          'refresh_secret_key',
        expiresIn:
          this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (err) {
      console.error('Refresh token error:', err);
      throw new UnauthorizedException('Invalid or expired refreshToken');
    }
  }

  async register(dto: registerDTO) {
    const isValidOtp = this.otpService.verifyOtp(dto.email, dto.otp);

    if (!isValidOtp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const data: UserDto = {
      ...dto,
      role: UserRole.CUSTOMER,
    };

    return this.userService.create(data);
  }
}
