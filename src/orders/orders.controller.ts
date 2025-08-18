import {
	Controller,
	Post,
	Get,
	Body,
	Query,
	ParseIntPipe,
	UseGuards,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiQuery,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: '상품 구매' })
	@ApiResponse({
		status: 201,
		description: '상품 구매 성공',
		schema: {
			example: { orderId: 1 },
		},
	})
	async create(@Body() create_order_dto: CreateOrderDto) {
		return this.ordersService.create(create_order_dto);
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
	@ApiResponse({
		status: 200,
		description: '주문 내역 조회 성공',
		schema: {
			example: [{ orderId: 1, product: '상품A' }],
		},
	})
	async findByUserId(@Query('user_id', ParseIntPipe) user_id: number) {
		return this.ordersService.findByUserId(user_id);
	}
}
