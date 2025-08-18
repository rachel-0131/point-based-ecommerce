import { Min, Max, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateOrderDto {
	@ApiProperty({
		description: '사용자 ID',
		example: 1,
		minimum: 1,
		maximum: 999999,
	})
	@Type(() => Number)
	@IsInt({ message: '사용자 ID는 정수여야 합니다' })
	@Min(1, { message: '사용자 ID는 1 이상이어야 합니다' })
	@Max(999999, { message: '사용자 ID가 유효 범위를 초과했습니다' })
	user_id: number;

	@ApiProperty({
		description: '상품 ID',
		example: 2,
		minimum: 1,
		maximum: 999999,
	})
	@Type(() => Number)
	@IsInt({ message: '상품 ID는 정수여야 합니다' })
	@Min(1, { message: '상품 ID는 1 이상이어야 합니다' })
	@Max(999999, { message: '상품 ID가 유효 범위를 초과했습니다' })
	product_id: number;

	@ApiProperty({
		description: '주문 수량',
		example: 1,
		required: false,
		minimum: 1,
		maximum: 100,
	})
	@Type(() => Number)
	@IsInt({ message: '주문 수량은 정수여야 합니다' })
	@Min(1, { message: '주문 수량은 1 이상이어야 합니다' })
	@Max(100, { message: '한 번에 주문할 수 있는 최대 수량은 100개입니다' })
	quantity?: number;
}