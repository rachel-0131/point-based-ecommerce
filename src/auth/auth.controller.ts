import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: '회원 가입' })
  @ApiResponse({ 
    status: 201, 
    description: '회원 가입 성공',
    schema: {
      example: { id: 1, email: 'user@example.com', name: '홍길동' }
    }
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인' })
  @ApiResponse({ 
    status: 200, 
    description: '로그인 성공',
    schema: {
      example: { 
        accessToken: 'jwt-token',
        user: { id: 1, email: 'user@example.com', name: '홍길동' }
      }
    }
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
