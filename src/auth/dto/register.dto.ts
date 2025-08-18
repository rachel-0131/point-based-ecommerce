import {
	IsEmail,
	IsString,
	MinLength,
	IsNotEmpty,
	Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
	@ApiProperty({
		description: '사용자 이메일',
		example: 'user@example.com',
	})
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({
		description: '비밀번호 (최소 10자, 영문, 숫자, 특수문자 포함)',
		example: 'Password123!',
	})
	@IsString()
	@MinLength(10)
	@Matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
		message: '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다',
	})
	@IsNotEmpty()
	password: string;

	@ApiProperty({
		description: '사용자 이름',
		example: '홍길동',
	})
	@IsString()
	@IsNotEmpty()
	name: string;
}
