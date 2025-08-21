import {
	Injectable,
	NotFoundException,
	ConflictException,
} from '@nestjs/common';
import { PointType } from '@prisma/client';

import { PasswordService } from '../auth/services/password.service';
import { OffsetPaginationDto } from '../common/dto/offset-pagination.dto';
import { PaginatedResponse } from '../common/interfaces/api-response.interface';
import { PaginationUtil } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';
import { ChargePointDto } from './dto/charge-point.dto';

@Injectable()
export class UsersService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly passwordService: PasswordService,
	) {}

	async create(dto: CreateUserDto) {
		const existing_user = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (existing_user) {
			throw new ConflictException('이미 존재하는 이메일입니다');
		}

		const hashed_password = await this.passwordService.hashPassword(
			dto.password,
		);

		return this.prisma.user.create({
			data: {
				email: dto.email,
				password: hashed_password,
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

		const formatted_history = history.map((item) => ({
			id: item.id,
			amount: item.amount,
			type: item.type,
			description: item.description,
			created_at: item.created_at,
		}));

		return PaginationUtil.createPaginatedResponse(
			formatted_history,
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
