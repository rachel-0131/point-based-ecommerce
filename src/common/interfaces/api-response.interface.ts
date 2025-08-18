export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
	pagination: {
		page: number;
		limit: number;
		total: number;
		total_pages: number;
	};
}