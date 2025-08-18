import { Min, Max, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ChargePointDto {
	@ApiProperty({
		description: '충전할 포인트 금액',
		example: 1000,
		minimum: 100,
		maximum: 1000000,
	})
	@Type(() => Number)
	@IsInt({ message: '포인트 금액은 정수여야 합니다' })
	@Min(100, { message: '최소 충전 금액은 100포인트입니다' })
	@Max(1000000, { message: '최대 충전 금액은 1,000,000포인트입니다' })
	amount: number;
}
