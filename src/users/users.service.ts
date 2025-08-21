import {
	Injectable,
	NotFoundException,
	ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ChargePointDto } from './dto/charge-point.dto';
import { OffsetPaginationDto } from '../common/dto/offset-pagination.dto';
import { PaginationUtil } from '../common/utils/pagination.util';
import { PaginatedResponse } from '../common/interfaces/api-response.interface';
import { PointType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateUserDto) {
		const existingUser = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (existingUser) {
			throw new ConflictException('이미 존재하는 이메일입니다');
		}

		const hashedPassword = await bcrypt.hash(dto.password, 12);

		return this.prisma.user.create({
			data: {
				email: dto.email,
				password: hashedPassword,
				name: dto.name,
			},
			select: {
				id: true,
				email: true,
				name: true,
			},
		});
	}

	async findOne(id: number) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				name: true,
				point: true,
			},
		});

		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		return user;
	}

	async chargePoint(user_id: number, dto: ChargePointDto) {
		const user = await this.prisma.user.findUnique({
			where: { id: user_id },
		});

		if (!user) {
			throw new NotFoundException(`User with ID ${user_id} not found`);
		}

		const result = await this.prisma.$transaction(async (tx) => {
			const updated_user = await tx.user.update({
				where: { id: user_id },
				data: {
					point: {
						increment: dto.amount,
					},
				},
			});

			await tx.pointHistory.create({
				data: {
					user_id: user_id,
					amount: dto.amount,
					type: PointType.CHARGE,
					description: '포인트 충전',
				},
			});

			return updated_user;
		});

		return { point: result.point };
	}

	async getPointHistory(
		user_id: number,
		dto: OffsetPaginationDto,
	): Promise<PaginatedResponse<any>> {
		const user = await this.prisma.user.findUnique({
			where: { id: user_id },
		});

		if (!user) {
			throw new NotFoundException(`User with ID ${user_id} not found`);
		}

		const { page = 1, limit = 10 } = dto;
		const { skip, take } = PaginationUtil.calculatePagination({
			page,
			limit,
		});

		const [history, total] = await Promise.all([
			this.prisma.pointHistory.findMany({
				where: { user_id },
				orderBy: {
					created_at: 'desc',
				},
				skip,
				take,
			}),
			this.prisma.pointHistory.count({
				where: { user_id },
			}),
		]);

		const formattedHistory = history.map((item) => ({
			id: item.id,
			amount: item.amount,
			type: item.type,
			description: item.description,
			created_at: item.created_at,
		}));

		return PaginationUtil.createPaginatedResponse(
			formattedHistory,
			total,
			page,
			limit,
		);
	}

	async findByEmail(email: string) {
		return this.prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				name: true,
			},
		});
	}
}
