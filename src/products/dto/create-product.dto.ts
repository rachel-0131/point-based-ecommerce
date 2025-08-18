import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
	@ApiProperty({
		description: '상품명',
		example: '상품A',
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		description: '상품 가격',
		example: 1000,
	})
	@IsNumber()
	@IsPositive()
	price: number;

	@ApiProperty({
		description: '재고 수량',
		example: 100,
		required: false,
	})
	@IsNumber()
	@IsPositive()
	stock?: number;
}