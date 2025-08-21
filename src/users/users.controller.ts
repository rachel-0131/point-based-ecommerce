import {
	Controller,
	Post,
	Get,
	Body,
	Param,
	ParseIntPipe,
	UseGuards,
	Query,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
	StandardApiResponse,
	ErrorApiResponse,
} from '../common/decorators/api-response.decorator';
import { OffsetPaginationDto } from '../common/dto/offset-pagination.dto';
import { User } from '../common/interfaces/user.interface';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ChargePointDto } from './dto/charge-point.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@ApiOperation({ summary: '회원 가입' })
	@StandardApiResponse(201, '회원 가입 성공')
	@ErrorApiResponse(409, '이미 존재하는 이메일')
	@ErrorApiResponse(400, '잘못된 요청 데이터')
	async create(@Body() dto: CreateUserDto) {
		return this.usersService.create(dto);
	}

	@Get('profile')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: '프로필 조회' })
	@StandardApiResponse(200, '프로필 조회 성공')
	@ErrorApiResponse(401, '인증되지 않은 사용자')
	@ErrorApiResponse(404, '사용자를 찾을 수 없음')
	async getProfile(@CurrentUser() user: User) {
		return this.usersService.findOne(user.id);
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: '회원 조회' })
	@StandardApiResponse(200, '회원 조회 성공')
	@ErrorApiResponse(401, '인증되지 않은 사용자')
	@ErrorApiResponse(404, '사용자를 찾을 수 없음')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		return this.usersService.findOne(id);
	}

	@Post(':id/points')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: '포인트 충전' })
	@StandardApiResponse(200, '포인트 충전 성공')
	@ErrorApiResponse(401, '인증되지 않은 사용자')
	@ErrorApiResponse(404, '사용자를 찾을 수 없음')
	@ErrorApiResponse(400, '잘못된 충전 금액')
	async chargePoint(
		@Param('id', ParseIntPipe) id: number,
		@Body() dto: ChargePointDto,
	) {
		return this.usersService.chargePoint(id, dto);
	}

	@Get(':id/point-history')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: '포인트 내역 조회' })
	@StandardApiResponse(200, '포인트 내역 조회 성공')
	@ErrorApiResponse(401, '인증되지 않은 사용자')
	@ErrorApiResponse(404, '사용자를 찾을 수 없음')
	async getPointHistory(
		@Param('id', ParseIntPipe) id: number,
		@Query() dto: OffsetPaginationDto,
	) {
		return this.usersService.getPointHistory(id, dto);
	}
}
