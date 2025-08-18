import {
	Controller,
	Post,
	Get,
	Body,
	Param,
	ParseIntPipe,
	UseGuards,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@ApiTags('products')
@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Post()
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth()
	@ApiOperation({ summary: '상품 등록 (관리자용)' })
	@ApiResponse({
		status: 201,
		description: '상품 등록 성공',
		schema: {
			example: { id: 1 },
		},
	})
	async create(@Body() create_product_dto: CreateProductDto) {
		return this.productsService.create(create_product_dto);
	}

	@Get()
	@ApiOperation({ summary: '상품 목록 조회' })
	@ApiResponse({
		status: 200,
		description: '상품 목록 조회 성공',
		schema: {
			example: [{ id: 1, name: 'A', price: 1000 }],
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
			example: { id: 1, name: 'A', price: 1000 },
		},
	})
	async findOne(@Param('id', ParseIntPipe) id: number) {
		return this.productsService.findOne(id);
	}
}
