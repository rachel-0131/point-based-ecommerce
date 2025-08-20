import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
	constructor(private readonly prisma: PrismaService) {}

	async create(create_product_dto: CreateProductDto) {
		return this.prisma.product.create({
			data: {
				name: create_product_dto.name,
				price: create_product_dto.price,
				stock: create_product_dto.stock || 0,
			},
			select: {
				id: true,
			},
		});
	}

	async findAll() {
		const products = await this.prisma.product.findMany({
			select: {
				id: true,
				name: true,
				price: true,
				stock: true,
			},
			orderBy: {
				id: 'desc', // 최근 등록된 상품이 먼저 나오도록 정렬
			},
		});

		return products.map((product) => ({
			...product,
			is_sold_out: product.stock <= 0, // 품절 여부 추가
		}));
	}

	async findOne(id: number) {
		const product = await this.prisma.product.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				price: true,
				stock: true,
			},
		});

		// 상품이 존재하지 않는 경우 예외 처리
		if (!product) {
			throw new NotFoundException(`Product with ID ${id} not found`);
		}

		return {
			...product,
			is_sold_out: product.stock <= 0, // 품절 여부 추가
		};
	}
}
