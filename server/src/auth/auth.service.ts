import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { SafeUser } from '../types/safe-user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: CreateUserDto): Promise<{ user: SafeUser; token: string }> {
    const user: SafeUser = await this.userService.createUser(dto);
    const token: string = this.jwtService.sign({ sub: String(user.id) });

    return { user, token };
  }

  async login(dto: LoginDto): Promise<{ user: SafeUser; token: string }> {
    const userWithPassword = await this.userService.getUserByEmailWithPassword(
      dto.email,
    );

    if (!userWithPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid: boolean = await bcrypt.compare(
      dto.password,
      userWithPassword.password,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...user } = userWithPassword;

    const token: string = this.jwtService.sign({ sub: String(user.id) });

    return { user, token };
  }
}
