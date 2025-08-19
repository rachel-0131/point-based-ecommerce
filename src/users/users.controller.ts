import {
	Controller,
	Post,
	Get,
	Body,
	Param,
	ParseIntPipe,
	UseGuards,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ChargePointDto } from './dto/charge-point.dto';

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
	async create(@Body() createUserDto: CreateUserDto) {
		return this.usersService.create(createUserDto);
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
		@Body() chargePointDto: ChargePointDto,
	) {
		return this.usersService.chargePoint(id, chargePointDto);
	}

	@Get(':id/point-history')
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: '포인트 내역 조회' })
	@ApiResponse({
		status: 200,
		description: '포인트 내역 조회 성공',
		schema: {
			example: [
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
		},
	})
	async getPointHistory(@Param('id', ParseIntPipe) id: number) {
		return this.usersService.getPointHistory(id);
	}
}
