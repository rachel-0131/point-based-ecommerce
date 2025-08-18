import {
	Controller,
	Post,
	Get,
	Body,
	Param,
	ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
}
