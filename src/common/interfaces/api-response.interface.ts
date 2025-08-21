export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	timestamp: string;
}

export interface OffsetPaginatedResponse<T = any> extends ApiResponse<T[]> {
	pagination: {
		page: number;
		limit: number;
		total: number;
		total_pages: number;
	};
}

export interface CursorPaginatedResponse<T = any> extends ApiResponse<T[]> {
	pagination: {
		limit: number;
		has_next: boolean;
		has_previous: boolean;
		next_cursor?: string;
		previous_cursor?: string;
	};
}

// 기존 호환성을 위한 alias
export interface PaginatedResponse<T = any> extends OffsetPaginatedResponse<T> {}