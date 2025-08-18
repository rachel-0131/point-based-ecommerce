import {
	Injectable,
	ExecutionContext,
	UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	constructor(private jwt_service: JwtService) {
		super();
	}

	canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		if (!token) {
			throw new UnauthorizedException('토큰이 필요합니다');
		}

		try {
			const payload = this.jwt_service.verify(token);
			request['user'] = payload;
		} catch (error) {
			if (error.name === 'TokenExpiredError') {
				throw new UnauthorizedException('토큰이 만료되었습니다');
			}
			throw new UnauthorizedException('유효하지 않은 토큰입니다');
		}

		return true;
	}

	private extractTokenFromHeader(request: any): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}