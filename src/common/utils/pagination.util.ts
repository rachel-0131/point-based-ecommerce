import { 
	OffsetPaginatedResponse, 
	CursorPaginatedResponse
} from '../interfaces/api-response.interface';

export interface OffsetPaginationOptions {
	page: number;
	limit: number;
}

export interface CursorPaginationOptions {
	cursor?: string;
	limit: number;
	direction: 'asc' | 'desc';
}

export interface OffsetPaginationResult {
	skip: number;
	take: number;
}

export interface CursorPaginationResult {
	take: number;
	cursor?: any;
	orderBy: any;
}

export interface CursorPaginationMeta {
	has_next: boolean;
	has_previous: boolean;
	next_cursor?: string;
	previous_cursor?: string;
}

export class PaginationUtil {
	// Offset 페이지네이션
	static calculateOffsetPagination(options: OffsetPaginationOptions): OffsetPaginationResult {
		const { page = 1, limit = 10 } = options;
		const skip = (page - 1) * limit;
		const take = limit;

		return { skip, take };
	}

	static createOffsetPaginatedResponse<T>(
		data: T[],
		total: number,
		page: number,
		limit: number,
	): OffsetPaginatedResponse<T> {
		const total_pages = Math.ceil(total / limit);

		return {
			success: true,
			data,
			pagination: {
				page,
				limit,
				total,
				total_pages,
			},
			timestamp: new Date().toISOString(),
		};
	}

	// Cursor 페이지네이션
	static calculateCursorPagination(
		options: CursorPaginationOptions,
		cursorField: string = 'id'
	): CursorPaginationResult {
		const { cursor, limit = 10, direction = 'desc' } = options;
		
		const orderBy = { [cursorField]: direction };
		const take = limit + 1; // 다음 페이지 존재 여부 확인을 위해 +1
		
		let cursorCondition = undefined;
		if (cursor) {
			const operator = direction === 'desc' ? 'lt' : 'gt';
			cursorCondition = {
				[cursorField]: {
					[operator]: cursor
				}
			};
		}

		return {
			take,
			cursor: cursorCondition,
			orderBy
		};
	}

	static createCursorPaginatedResponse<T>(
		data: T[],
		limit: number,
		cursorField: string = 'id',
		_direction: 'asc' | 'desc' = 'desc'
	): CursorPaginatedResponse<T> {
		const has_next = data.length > limit;
		const actualData = has_next ? data.slice(0, limit) : data;
		
		let next_cursor: string | undefined;
		let previous_cursor: string | undefined;

		if (actualData.length > 0) {
			if (has_next) {
				next_cursor = String(actualData[actualData.length - 1][cursorField]);
			}
			
			// 첫 번째 아이템의 cursor는 이전 페이지 요청시 사용
			previous_cursor = String(actualData[0][cursorField]);
		}

		return {
			success: true,
			data: actualData,
			pagination: {
				limit,
				has_next,
				has_previous: !!next_cursor, // 실제로는 더 정확한 로직이 필요하지만 단순화
				next_cursor,
				previous_cursor,
			},
			timestamp: new Date().toISOString(),
		};
	}

	// 기존 호환성을 위한 메서드들
	static calculatePagination = PaginationUtil.calculateOffsetPagination;
	static createPaginatedResponse = PaginationUtil.createOffsetPaginatedResponse;
}