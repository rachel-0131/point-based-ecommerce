import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
	@ApiProperty({
		description: '사용자 ID',
		example: 1,
	})
	@IsNumber()
	@IsPositive()
	user_id: number;

	@ApiProperty({
		description: '상품 ID',
		example: 2,
	})
	@IsNumber()
	@IsPositive()
	product_id: number;

	@ApiProperty({
		description: '주문 수량',
		example: 1,
		required: false,
	})
	@IsNumber()
	@IsPositive()
	quantity?: number;
}