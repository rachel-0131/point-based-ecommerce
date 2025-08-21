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
	ApiResponse,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ChargePointDto } from './dto/charge-point.dto';
import { OffsetPaginationDto } from '../common/dto/offset-pagination.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@ApiOperation({ summary: '회원 가입' })
	@ApiResponse({
		status: 201,
		description: '회원 가입 성공',
		schema: {
			example: { id: 1, email: 'user@example.com', name: '홍길동' },
		},
	})
	async create(@Body() dto: CreateUserDto) {
		return this.usersService.create(dto);
	}

	@Get('profile')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: '프로필 조회' })
	@ApiResponse({
		status: 200,
		description: '프로필 조회 성공',
		schema: {
			example: {
				id: 1,
				email: 'user@example.com',
				name: '홍길동',
				point: 1500,
			},
		},
	})
	async getProfile(@CurrentUser() user: any) {
		return this.usersService.findOne(user.id);
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: '회원 조회' })
	@ApiResponse({
		status: 200,
		description: '회원 조회 성공',
		schema: {
			example: { id: 1, name: '홍길동', point: 1000 },
		},
	})
	async findOne(@Param('id', ParseIntPipe) id: number) {
		return this.usersService.findOne(id);
	}

	@Post(':id/points')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: '포인트 충전' })
	@ApiResponse({
		status: 200,
		description: '포인트 충전 성공',
		schema: {
			example: { point: 2000 },
		},
	})
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
	@ApiResponse({
		status: 200,
		description: '포인트 내역 조회 성공',
		schema: {
			example: {
				success: true,
				data: [
					{
						id: 1,
						amount: 1000,
						type: 'CHARGE',
						description: '포인트 충전',
						created_at: '2025-08-19T12:00:00.000Z',
					},
					{
						id: 2,
						amount: -500,
						type: 'USE',
						description: '상품 구매 (주문 ID: 1)',
						created_at: '2025-08-19T12:30:00.000Z',
					},
				],
				pagination: {
					page: 1,
					limit: 10,
					total: 2,
					total_pages: 1,
				},
				timestamp: '2025-08-21T00:00:00.000Z',
			},
		},
	})
	async getPointHistory(
		@Param('id', ParseIntPipe) id: number,
		@Query() dto: OffsetPaginationDto,
	) {
		return this.usersService.getPointHistory(id, dto);
	}
}
