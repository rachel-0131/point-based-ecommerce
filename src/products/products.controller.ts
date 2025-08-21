import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import {
	StandardApiResponse,
	ErrorApiResponse,
} from '../common/decorators/api-response.decorator';
import { OffsetPaginationDto } from '../common/dto/offset-pagination.dto';

import { ProductsService } from './products.service';

@ApiTags('products')
@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Get()
	@ApiOperation({ summary: '상품 목록 조회' })
	@StandardApiResponse(200, '상품 목록 조회 성공')
	@ErrorApiResponse(400, '잘못된 페이지네이션 파라미터')
	async findAll(@Query() dto: OffsetPaginationDto) {
		return this.productsService.findAll(dto);
	}

	@Get(':id')
	@ApiOperation({ summary: '상품 단건 조회' })
	@StandardApiResponse(200, '상품 단건 조회 성공')
	@ErrorApiResponse(404, '상품을 찾을 수 없음')
	@ErrorApiResponse(400, '잘못된 상품 ID')
	async findOne(@Param('id', ParseIntPipe) id: number) {
		return this.productsService.findOne(id);
	}
}
