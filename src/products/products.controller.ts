import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { OffsetPaginationDto } from '../common/dto/offset-pagination.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Get()
	@ApiOperation({ summary: '상품 목록 조회' })
	@ApiResponse({
		status: 200,
		description: '상품 목록 조회 성공',
		schema: {
			example: {
				success: true,
				data: [
					{
						id: 1,
						name: 'A',
						price: 1000,
						stock: 100,
						is_sold_out: false,
					},
				],
				pagination: {
					page: 1,
					limit: 10,
					total: 1,
					total_pages: 1,
				},
				timestamp: '2025-08-21T00:00:00.000Z',
			},
		},
	})
	async findAll(@Query() dto: OffsetPaginationDto) {
		return this.productsService.findAll(dto);
	}

	@Get(':id')
	@ApiOperation({ summary: '상품 단건 조회' })
	@ApiResponse({
		status: 200,
		description: '상품 단건 조회 성공',
		schema: {
			example: { id: 1, name: 'A', price: 1000, stock: 100 },
		},
	})
	async findOne(@Param('id', ParseIntPipe) id: number) {
		return this.productsService.findOne(id);
	}
}
