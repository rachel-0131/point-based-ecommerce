import {
	IsString,
	IsNotEmpty,
	MinLength,
	MaxLength,
	Min,
	Max,
	IsInt,
	IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
	@ApiProperty({
		description: '상품명',
		example: '상품A',
		minLength: 1,
		maxLength: 100,
	})
	@IsString({ message: '상품명은 문자열이어야 합니다' })
	@IsNotEmpty({ message: '상품명은 필수입니다' })
	@MinLength(1, { message: '상품명은 최소 1자 이상이어야 합니다' })
	@MaxLength(100, { message: '상품명은 최대 100자까지 가능합니다' })
	name: string;

	@ApiProperty({
		description: '상품 가격',
		example: 1000,
		minimum: 1,
		maximum: 10000000,
	})
	@Type(() => Number)
	@IsInt({ message: '상품 가격은 정수여야 합니다' })
	@Min(1, { message: '상품 가격은 1원 이상이어야 합니다' })
	@Max(10000000, { message: '상품 가격은 10,000,000원 이하여야 합니다' })
	price: number;

	@ApiProperty({
		description: '재고 수량',
		example: 100,
		required: false,
		minimum: 0,
		maximum: 999999,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt({ message: '재고 수량은 정수여야 합니다' })
	@Min(0, { message: '재고 수량은 0 이상이어야 합니다' })
	@Max(999999, { message: '재고 수량은 999,999개 이하여야 합니다' })
	stock?: number;
}