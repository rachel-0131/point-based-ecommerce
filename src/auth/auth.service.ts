import {
	Injectable,
	ConflictException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './services/password.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt_service: JwtService,
		private readonly password_service: PasswordService,
	) {}

	async register(dto: RegisterDto) {
		const existing_user = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (existing_user) {
			throw new ConflictException('이미 존재하는 이메일입니다');
		}

		const hashed_password = await this.password_service.hashPassword(
			dto.password,
		);

		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				password: hashed_password,
				name: dto.name,
			},
			select: {
				id: true,
				email: true,
				name: true,
			},
		});

		return user;
	}

	async login(dto: LoginDto) {
		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (!user) {
			throw new UnauthorizedException(
				'이메일 또는 비밀번호가 올바르지 않습니다',
			);
		}

		const is_password_valid = await this.password_service.comparePassword(
			dto.password,
			user.password,
		);

		if (!is_password_valid) {
			throw new UnauthorizedException(
				'이메일 또는 비밀번호가 올바르지 않습니다',
			);
		}

		const payload = { sub: user.id, email: user.email };
		const access_token = this.jwt_service.sign(payload);

		return {
			accessToken: access_token,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
			},
		};
	}
}
