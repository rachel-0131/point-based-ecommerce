import { Injectable, NotFoundException } from '@nestjs/common';

import { OffsetPaginationDto } from '../common/dto/offset-pagination.dto';
import { PaginatedResponse } from '../common/interfaces/api-response.interface';
import { PaginationUtil } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';

import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateProductDto) {
		return this.prisma.product.create({
			data: {
				name: dto.name,
				price: dto.price,
				stock: dto.stock || 0,
			},
			select: {
				id: true,
			},
		});
	}

	async findAll(dto: OffsetPaginationDto): Promise<PaginatedResponse<any>> {
		const { page = 1, limit = 10 } = dto;
		const { skip, take } = PaginationUtil.calculatePagination({
			page,
			limit,
		});

		const [products, total] = await Promise.all([
			this.prisma.product.findMany({
				select: {
					id: true,
					name: true,
					price: true,
					stock: true,
				},
				orderBy: {
					id: 'desc',
				},
				skip,
				take,
			}),
			this.prisma.product.count(),
		]);

		const formatted_products = products.map((product) => ({
			...product,
			is_sold_out: product.stock <= 0,
		}));

		return PaginationUtil.createPaginatedResponse(
			formatted_products,
			total,
			page,
			limit,
		);
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
