import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { PointType } from '@prisma/client';

describe('사용자 컨트롤러 (e2e)', () => {
  let app: INestApplication;
  let mock_usersService: jest.Mocked<UsersService>;
  let mockPrismaService: jest.Mocked<Partial<PrismaService>>;
  let mockJwtAuthGuard: jest.Mocked<Partial<JwtAuthGuard>>;

  beforeEach(async () => {
    // Mock UsersService
    mock_usersService = {
      create: jest.fn(),
      findOne: jest.fn(),
      chargePoint: jest.fn(),
      getPointHistory: jest.fn(),
    } as any;

    // Mock PrismaService
    mockPrismaService = {};

    // Mock JwtAuthGuard to bypass authentication for testing
    mockJwtAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mock_usersService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));

    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('/users (POST)', () => {
    it('새 사용자를 성공적으로 생성합니다', () => {
      const create_user_dto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: '홍길동',
      };

      const mock_user = {
        id: 1,
        email: 'test@example.com',
        name: '홍길동',
      };

      mock_usersService.create.mockResolvedValue(mock_user);

      return request(app.getHttpServer())
        .post('/users')
        .send(create_user_dto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(mock_user);
          expect(mock_usersService.create).toHaveBeenCalledWith(create_user_dto);
        });
    });
  });

  describe('/users/:id/points (POST)', () => {
    it('포인트를 성공적으로 충전합니다', () => {
      const charge_point_dto = {
        amount: 1000,
      };

      const mock_result = {
        point: 2000,
      };

      mock_usersService.chargePoint.mockResolvedValue(mock_result);

      return request(app.getHttpServer())
        .post('/users/1/points')
        .send(charge_point_dto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(mock_result);
          expect(mock_usersService.chargePoint).toHaveBeenCalledWith(1, charge_point_dto);
        });
    });
  });

  describe('/users/:id/point-history (GET)', () => {
    it('포인트 내역을 성공적으로 조회합니다', () => {
      const mock_history = [
        {
          id: 1,
          amount: 1000,
          type: PointType.CHARGE,
          description: '포인트 충전',
          created_at: new Date('2025-08-19T12:00:00.000Z'),
        },
        {
          id: 2,
          amount: -500,
          type: PointType.USE,
          description: '상품 구매 (주문 ID: 1)',
          created_at: new Date('2025-08-19T12:30:00.000Z'),
        },
      ];

      const mock_paginated_history = {
        success: true,
        data: mock_history,
        timestamp: new Date().toISOString(),
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          total_pages: 1
        }
      };

      mock_usersService.getPointHistory.mockResolvedValue(mock_paginated_history);

      return request(app.getHttpServer())
        .get('/users/1/point-history')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveLength(2);
          expect(res.body.data[0]).toMatchObject({
            id: 1,
            amount: 1000,
            type: 'CHARGE',
            description: '포인트 충전',
          });
          expect(res.body.data[1]).toMatchObject({
            id: 2,
            amount: -500,
            type: 'USE',
            description: '상품 구매 (주문 ID: 1)',
          });
          expect(mock_usersService.getPointHistory).toHaveBeenCalledWith(1, expect.objectContaining({ page: 1, limit: 10 }));
        });
    });
  });
});