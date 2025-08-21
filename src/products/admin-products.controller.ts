import {
	Controller,
	Post,
	Body,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@ApiTags('admin-products')
@Controller('admin/products')
export class AdminProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Post()
	@ApiOperation({ summary: '상품 등록 (관리자용, 인증 없음)' })
	@ApiResponse({
		status: 201,
		description: '상품 등록 성공',
		schema: {
			example: { id: 1 },
		},
	})
	async create(@Body() dto: CreateProductDto) {
		return this.productsService.create(dto);
	}
}