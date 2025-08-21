import {
	Controller,
	Post,
	Get,
	Body,
	Query,
	ParseIntPipe,
	UseGuards,
	ForbiddenException,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiQuery,
	ApiBearerAuth,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
	StandardApiResponse,
	ErrorApiResponse,
} from '../common/decorators/api-response.decorator';
import { User } from '../common/interfaces/user.interface';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ORDER_ERROR_MESSAGES } from './constants/error-messages.constants';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: '상품 구매' })
	@StandardApiResponse(201, '상품 구매 성공')
	@ErrorApiResponse(401, '인증되지 않은 사용자')
	@ErrorApiResponse(404, '상품 또는 사용자를 찾을 수 없음')
	@ErrorApiResponse(400, '포인트 부족 또는 재고 부족')
	@ErrorApiResponse(422, '구매할 수 없는 상품')
	async create(@Body() dto: CreateOrderDto) {
		return this.ordersService.create(dto);
	}

	@Get()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: '주문 내역 조회' })
	@ApiQuery({
		name: 'user_id',
		description: '사용자 ID',
		example: 1,
	})
	@StandardApiResponse(200, '주문 내역 조회 성공')
	@ErrorApiResponse(401, '인증되지 않은 사용자')
	@ErrorApiResponse(403, '접근 권한 없음')
	@ErrorApiResponse(400, '잘못된 사용자 ID')
	async findByUserId(
		@Query('user_id', ParseIntPipe) user_id: number,
		@CurrentUser() user: User,
	) {
		if (user.id !== user_id) {
			throw new ForbiddenException(
				ORDER_ERROR_MESSAGES.ORDER_ACCESS_DENIED,
			);
		}
		return this.ordersService.findByUserId(user_id);
	}
}
