import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard, GetUser } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: CreateUserDto) {
    console.log('📝 Signup DTO received:', dto);
    console.log('📝 Password field:', dto.password);
    return this.authService.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser() user: any) {
    return user;
  }
}
