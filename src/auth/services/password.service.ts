import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
	constructor(private readonly config_service: ConfigService) {}

	async hashPassword(password: string): Promise<string> {
		const salt_rounds = this.config_service.get('BCRYPT_SALT_ROUNDS', 12);
		return bcrypt.hash(password, +salt_rounds);
	}

	async comparePassword(
		password: string,
		hashed_password: string,
	): Promise<boolean> {
		return bcrypt.compare(password, hashed_password);
	}
}