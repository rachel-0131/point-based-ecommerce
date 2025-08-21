import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PointType } from '@prisma/client';
import {
	InsufficientPointsException,
	InsufficientStockException,
	UserNotFoundException,
	ProductNotFoundException,
} from './exceptions/order.exceptions';

@Injectable()
export class OrdersService {
	constructor(private readonly prisma: PrismaService) {}

	// 상품 구매 (주문 생성)
	async create(dto: CreateOrderDto) {
		const result = await this.prisma.$transaction(async (tx) => {
			// 트랜잭션 내에서 사용자 조회 (최신 포인트 잔액 확보)
			const user = await tx.user.findUnique({
				where: { id: dto.user_id },
			});

			if (!user) {
				throw new UserNotFoundException();
			}

			// 트랜잭션 내에서 상품 조회 (최신 재고 확보)
			const product = await tx.product.findUnique({
				where: { id: dto.product_id },
			});

			if (!product) {
				throw new ProductNotFoundException();
			}

			const quantity = dto.quantity || 1;
			const total_price = product.price * quantity;

			// 트랜잭션 내에서 포인트 검증
			if (user.point < total_price) {
				throw new InsufficientPointsException();
			}

			// 재고 검증과 동시에 원자적 업데이트
			const updated_product = await tx.product.updateMany({
				where: {
					id: dto.product_id,
					stock: { gte: quantity },
				},
				data: {
					stock: {
						decrement: quantity,
					},
				},
			});

			// 업데이트된 행이 없으면 재고 부족
			if (updated_product.count === 0) {
				throw new InsufficientStockException();
			}

			// 사용자 포인트 차감
			await tx.user.update({
				where: { id: dto.user_id },
				data: {
					point: {
						decrement: total_price,
					},
				},
			});

			// 주문 생성
			const order = await tx.order.create({
				data: {
					user_id: dto.user_id,
					product_id: dto.product_id,
					quantity,
					total_price,
				},
			});

			// 포인트 사용 내역 기록
			await tx.pointHistory.create({
				data: {
					user_id: dto.user_id,
					amount: -total_price,
					type: PointType.USE,
					description: `상품 구매 (주문 ID: ${order.id})`,
				},
			});

			return order;
		});

		return { order_id: result.id };
	}

	// 유저 아이디로 주문 내역 조회
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
