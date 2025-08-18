import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
	@ApiProperty({
		description: '사용자 이메일',
		example: 'user@example.com',
	})
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@ApiProperty({
		description: '비밀번호',
		example: 'Password123!',
	})
	@IsString()
	@IsNotEmpty()
	password: string;
}
