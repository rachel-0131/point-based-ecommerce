import {
	Controller,
	Get,
	Param,
	ParseIntPipe,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';

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
			example: [{ id: 1, name: 'A', price: 1000, stock: 100 }],
		},
	})
	async findAll() {
		return this.productsService.findAll();
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
