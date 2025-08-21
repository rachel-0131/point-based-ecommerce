import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CursorPaginationDto {
	@ApiPropertyOptional({
		description: '커서 값 (이전 페이지의 마지막 아이템 ID)',
		example: '10',
	})
	@IsOptional()
	@IsString()
	cursor?: string;

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

	@ApiPropertyOptional({
		description: '정렬 방향 (asc: 오름차순, desc: 내림차순)',
		example: 'desc',
		enum: ['asc', 'desc'],
		default: 'desc',
	})
	@IsOptional()
	@IsString()
	direction?: 'asc' | 'desc' = 'desc';
}