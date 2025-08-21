import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { PointType } from '@prisma/client';

describe('UsersController (e2e)', () => {
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
      findByEmail: jest.fn(),
    } as any;

    // Mock PrismaService
    mockPrismaService = {};

    // Mock JwtAuthGuard to bypass authentication for testing
    mockJwtAuthGuard = {
      canActivate: jest.fn().mockImplementation((context) => {
        const request = context.switchToHttp().getRequest();
        request.user = { id: 1 }; // Mock user data
        return true;
      }),
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
    it('should create a new user successfully', () => {
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

    it('should fail when email is invalid', () => {
      const create_user_dto = {
        email: 'invalid-email',
        password: 'Password123!',
        name: '홍길동',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(create_user_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('email must be an email');
        });
    });

    it('should fail when email is empty', () => {
      const create_user_dto = {
        email: '',
        password: 'Password123!',
        name: '홍길동',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(create_user_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('email should not be empty');
        });
    });

    it('should fail when password is too short', () => {
      const create_user_dto = {
        email: 'test@example.com',
        password: 'Pass1!', // 6자 (10자 미만)
        name: '홍길동',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(create_user_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('password must be longer than or equal to 10 characters');
        });
    });

    it('should fail when password lacks special characters', () => {
      const create_user_dto = {
        email: 'test@example.com',
        password: 'Password123', // 특수문자 없음
        name: '홍길동',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(create_user_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다');
        });
    });

    it('should fail when password lacks numbers', () => {
      const create_user_dto = {
        email: 'test@example.com',
        password: 'Password!@#', // 숫자 없음
        name: '홍길동',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(create_user_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다');
        });
    });

    it('should fail when password lacks letters', () => {
      const create_user_dto = {
        email: 'test@example.com',
        password: '1234567890!', // 영문 없음
        name: '홍길동',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(create_user_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다');
        });
    });

    it('should fail when name is empty', () => {
      const create_user_dto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: '',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(create_user_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('name should not be empty');
        });
    });

    it('should fail when name is not a string', () => {
      const create_user_dto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 123,
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(create_user_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('name must be a string');
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return user information successfully', () => {
      const mock_user = {
        id: 1,
        email: 'user@example.com',
        name: '홍길동',
        point: 1000,
      };

      mock_usersService.findOne.mockResolvedValue(mock_user);

      return request(app.getHttpServer())
        .get('/users/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mock_user);
          expect(mock_usersService.findOne).toHaveBeenCalledWith(1);
        });
    });

    it('should fail when id is not a number', () => {
      return request(app.getHttpServer())
        .get('/users/abc')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Validation failed');
          expect(mock_usersService.findOne).not.toHaveBeenCalled();
        });
    });

    it('should handle negative id (ParseIntPipe allows it)', () => {
      const mock_user = {
        id: -1,
        email: 'test@example.com',
        name: '테스트유저',
        point: 1000,
      };

      mock_usersService.findOne.mockResolvedValue(mock_user);

      return request(app.getHttpServer())
        .get('/users/-1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mock_user);
          expect(mock_usersService.findOne).toHaveBeenCalledWith(-1);
        });
    });
  });

  describe('/users/:id/points (POST)', () => {
    it('should charge points successfully', () => {
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

    it('should fail when amount is below minimum', () => {
      const charge_point_dto = {
        amount: 50, // 최소값 100 미만
      };

      return request(app.getHttpServer())
        .post('/users/1/points')
        .send(charge_point_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('최소 충전 금액은 100포인트입니다');
        });
    });

    it('should fail when amount exceeds maximum', () => {
      const charge_point_dto = {
        amount: 1000001, // 최대값 1000000 초과
      };

      return request(app.getHttpServer())
        .post('/users/1/points')
        .send(charge_point_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('최대 충전 금액은 1,000,000포인트입니다');
        });
    });

    it('should fail when amount is not an integer', () => {
      const charge_point_dto = {
        amount: 1000.5, // 소수점 포함
      };

      return request(app.getHttpServer())
        .post('/users/1/points')
        .send(charge_point_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('포인트 금액은 정수여야 합니다');
        });
    });

    it('should fail when amount is not provided', () => {
      const charge_point_dto = {};

      return request(app.getHttpServer())
        .post('/users/1/points')
        .send(charge_point_dto)
        .expect(400);
    });

    it('should fail when user id is invalid', () => {
      const charge_point_dto = {
        amount: 1000,
      };

      return request(app.getHttpServer())
        .post('/users/abc/points')
        .send(charge_point_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Validation failed');
          expect(mock_usersService.chargePoint).not.toHaveBeenCalled();
        });
    });
  });

  describe('/users/:id/point-history (GET)', () => {
    it('should return point history successfully', () => {
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

      mock_usersService.getPointHistory.mockResolvedValue(mock_history);

      return request(app.getHttpServer())
        .get('/users/1/point-history')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(2);
          expect(res.body[0]).toMatchObject({
            id: 1,
            amount: 1000,
            type: 'CHARGE',
            description: '포인트 충전',
          });
          expect(res.body[1]).toMatchObject({
            id: 2,
            amount: -500,
            type: 'USE',
            description: '상품 구매 (주문 ID: 1)',
          });
          expect(mock_usersService.getPointHistory).toHaveBeenCalledWith(1);
        });
    });

    it('should fail when user id is invalid', () => {
      return request(app.getHttpServer())
        .get('/users/abc/point-history')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Validation failed');
          expect(mock_usersService.getPointHistory).not.toHaveBeenCalled();
        });
    });

    it('should return empty array for user with no history', () => {
      mock_usersService.getPointHistory.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get('/users/999/point-history')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([]);
          expect(mock_usersService.getPointHistory).toHaveBeenCalledWith(999);
        });
    });
  });

  describe('/users/profile (GET)', () => {
    it('should return user profile successfully', () => {
      const mock_user = {
        id: 1,
        email: 'user@example.com',
        name: '홍길동',
        point: 1500,
      };

      // Mock JwtAuthGuard의 request.user를 시뮬레이션
      const _mock_request = {
			user: { id: 1 },
		};

      mock_usersService.findOne.mockResolvedValue(mock_user);

      return request(app.getHttpServer())
        .get('/users/profile')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mock_user);
        });
    });

    it('should fail when user is not found', () => {
      const _mock_request = {
			user: { id: 999 },
		};

      mock_usersService.findOne.mockRejectedValue(
        new Error('User with ID 999 not found'),
      );

      return request(app.getHttpServer()).get('/users/profile').expect(500);
    });
  });
});