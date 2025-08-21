import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
	StandardApiResponse,
	ErrorApiResponse,
} from '../common/decorators/api-response.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('register')
	@ApiOperation({ summary: '회원 가입' })
	@StandardApiResponse(201, '회원 가입 성공')
	@ErrorApiResponse(409, '이미 존재하는 이메일')
	@ErrorApiResponse(400, '잘못된 요청 데이터')
	async register(@Body() dto: RegisterDto) {
		return this.authService.register(dto);
	}

	@Post('login')
	@ApiOperation({ summary: '로그인' })
	@StandardApiResponse(200, '로그인 성공')
	@ErrorApiResponse(401, '이메일 또는 비밀번호가 올바르지 않음')
	@ErrorApiResponse(400, '잘못된 요청 데이터')
	async login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}
}
