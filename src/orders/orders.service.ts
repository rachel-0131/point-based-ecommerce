import {
	Injectable,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PointType } from '@prisma/client';

@Injectable()
export class OrdersService {
	constructor(private readonly prisma: PrismaService) {}

	async create(create_order_dto: CreateOrderDto) {
		const user = await this.prisma.user.findUnique({
			where: { id: create_order_dto.user_id },
		});

		if (!user) {
			throw new NotFoundException(`사용자를 찾을 수 없습니다`);
		}

		const product = await this.prisma.product.findUnique({
			where: { id: create_order_dto.product_id },
		});

		if (!product) {
			throw new NotFoundException(`상품을 찾을 수 없습니다`);
		}

		const quantity = create_order_dto.quantity || 1;
		const total_price = product.price * quantity;

		if (user.point < total_price) {
			throw new BadRequestException('포인트가 부족합니다');
		}

		const result = await this.prisma.$transaction(async (tx) => {
			// 트랜잭션 내에서 재고를 확인해서 race condition 방지
			const current_product = await tx.product.findUnique({
				where: { id: product.id },
			});

			if (current_product.stock < quantity) {
				throw new BadRequestException('해당 상품의 재고가 부족합니다');
			}

			// 사용자 포인트 차감
			await tx.user.update({
				where: { id: create_order_dto.user_id },
				data: {
					point: {
						decrement: total_price,
					},
				},
			});

			// 상품 재고 차감
			const updated_product = await tx.product.update({
				where: { id: create_order_dto.product_id },
				data: {
					stock: {
						decrement: quantity,
					},
				},
			});

			// 차감 후 음수 재고가 발생하는지 예외 처리
			if (updated_product.stock < 0) {
				throw new BadRequestException('해당 상품의 재고가 부족합니다');
			}

			// 주문 생성
			const order = await tx.order.create({
				data: {
					user_id: create_order_dto.user_id,
					product_id: create_order_dto.product_id,
					quantity,
					total_price,
				},
			});

			// 포인트 사용 내역 기록
			await tx.pointHistory.create({
				data: {
					user_id: create_order_dto.user_id,
					amount: -total_price,
					type: PointType.USE,
					description: `상품 구매 (주문 ID: ${order.id})`,
				},
			});

			return order;
		});

		return { order_id: result.id };
	}

	async findByUserId(user_id: number) {
		const orders = await this.prisma.order.findMany({
			where: { user_id },
			include: {
				product: {
					select: {
						name: true,
					},
				},
			},
			orderBy: {
				created_at: 'desc',
			},
		});

		return orders.map((order) => ({
			order_id: order.id,
			product: order.product.name,
		}));
	}
}
