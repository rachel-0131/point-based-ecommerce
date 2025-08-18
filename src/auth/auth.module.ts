import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PasswordService } from './services/password.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
	imports: [
		PrismaModule,
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: (config_service: ConfigService) => {
				const jwt_secret = config_service.get('JWT_SECRET');
				if (!jwt_secret) {
					throw new Error('JWT_SECRET is required in environment variables');
				}
				return {
					secret: jwt_secret,
					signOptions: {
						expiresIn: config_service.get('JWT_EXPIRES_IN', '15m'),
						issuer: 'point-ecommerce',
						audience: 'point-ecommerce-users',
					},
				};
			},
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtAuthGuard, PasswordService],
	exports: [AuthService, JwtAuthGuard, JwtModule, PasswordService],
})
export class AuthModule {}
