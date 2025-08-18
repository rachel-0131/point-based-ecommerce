import {
	Controller,
	Post,
	Get,
	Body,
	Query,
	ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
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
	@ApiOperation({ summary: '주문 내역 조회' })
	@ApiQuery({
		name: 'userId',
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
	async findByUserId(@Query('userId', ParseIntPipe) user_id: number) {
		return this.ordersService.findByUserId(user_id);
	}
}
