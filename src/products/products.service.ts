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
		return this.prisma.product.findMany({
			select: {
				id: true,
				name: true,
				price: true,
			},
		});
	}

	async findOne(id: number) {
		const product = await this.prisma.product.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				price: true,
			},
		});

		if (!product) {
			throw new NotFoundException(`Product with ID ${id} not found`);
		}

		return product;
	}
}
