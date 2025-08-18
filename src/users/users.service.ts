import {
	Injectable,
	NotFoundException,
	ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ChargePointDto } from './dto/charge-point.dto';
import { PointType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async create(createUserDto: CreateUserDto) {
		const existingUser = await this.prisma.user.findUnique({
			where: { email: createUserDto.email },
		});

		if (existingUser) {
			throw new ConflictException('이미 존재하는 이메일입니다');
		}

		const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

		return this.prisma.user.create({
			data: {
				email: createUserDto.email,
				password: hashedPassword,
				name: createUserDto.name,
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
				name: true,
				point: true,
			},
		});

		if (!user) {
			throw new NotFoundException(`User with ID ${id} not found`);
		}

		return user;
	}

	async chargePoint(user_id: number, charge_point_dto: ChargePointDto) {
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
						increment: charge_point_dto.amount,
					},
				},
			});

			await tx.pointHistory.create({
				data: {
					user_id: user_id,
					amount: charge_point_dto.amount,
					type: PointType.CHARGE,
					description: '포인트 충전',
				},
			});

			return updated_user;
		});

		return { point: result.point };
	}
}
