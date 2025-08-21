import { IsOptional, IsPositive, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class OffsetPaginationDto {
	@ApiPropertyOptional({
		description: '페이지 번호 (1부터 시작)',
		example: 1,
		minimum: 1,
		default: 1,
	})
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	@Min(1)
	page?: number = 1;

	@ApiPropertyOptional({
		description: '한 페이지당 항목 수',
		example: 10,
		minimum: 1,
		maximum: 100,
		default: 10,
	})
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number = 10;
}