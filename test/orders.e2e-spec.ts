import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { OrdersController } from '../src/orders/orders.controller';
import { OrdersService } from '../src/orders/orders.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let mock_ordersService: jest.Mocked<OrdersService>;
  let mockPrismaService: jest.Mocked<Partial<PrismaService>>;
  let mockJwtAuthGuard: jest.Mocked<Partial<JwtAuthGuard>>;

  beforeEach(async () => {
    // Mock OrdersService
    mock_ordersService = {
      create: jest.fn(),
      findByUserId: jest.fn(),
    } as any;

    // Mock PrismaService
    mockPrismaService = {};

    // Mock JwtAuthGuard to bypass authentication for testing
    mockJwtAuthGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mock_ordersService,
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

  describe('/orders (POST)', () => {
		it('should create a new order successfully', () => {
			const create_order_dto = {
				user_id: 1,
				product_id: 2,
				quantity: 3,
			};

			const mock_result = {
				order_id: 1,
			};

			mock_ordersService.create.mockResolvedValue(mock_result);

			return request(app.getHttpServer())
				.post('/orders')
				.send(create_order_dto)
				.expect(201)
				.expect((res) => {
					expect(res.body).toEqual(mock_result);
					expect(mock_ordersService.create).toHaveBeenCalledWith(
						create_order_dto,
					);
				});
		});

		it('should fail when quantity is missing (not optional in validation)', () => {
			const create_order_dto = {
				user_id: 1,
				product_id: 2,
			};

			return request(app.getHttpServer())
				.post('/orders')
				.send(create_order_dto)
				.expect(400)
				.expect((res) => {
					expect(res.body.message).toContain(
						'주문 수량은 정수여야 합니다',
					);
				});
		});

		it('should fail when user_id is missing', () => {
			const create_order_dto = {
				product_id: 2,
				quantity: 1,
			};

			return request(app.getHttpServer())
				.post('/orders')
				.send(create_order_dto)
				.expect(400);
		});

		it('should fail when product_id is missing', () => {
			const create_order_dto = {
				user_id: 1,
				quantity: 1,
			};

			return request(app.getHttpServer())
				.post('/orders')
				.send(create_order_dto)
				.expect(400);
		});

		it('should fail when user_id is less than 1', () => {
			const create_order_dto = {
				user_id: 0,
				product_id: 2,
				quantity: 1,
			};

			return request(app.getHttpServer())
				.post('/orders')
				.send(create_order_dto)
				.expect(400)
				.expect((res) => {
					expect(res.body.message).toContain(
						'사용자 ID는 1 이상이어야 합니다',
					);
				});
		});

		it('should fail when user_id exceeds maximum', () => {
			const create_order_dto = {
				user_id: 1000000, // 최대값 999999 초과
				product_id: 2,
				quantity: 1,
			};

			return request(app.getHttpServer())
				.post('/orders')
				.send(create_order_dto)
				.expect(400)
				.expect((res) => {
					expect(res.body.message).toContain(
						'사용자 ID가 유효 범위를 초과했습니다',
					);
				});
		});

		it('should fail when user_id is not an integer', () => {
			const create_order_dto = {
				user_id: 1.5, // 소수점 포함
				product_id: 2,
				quantity: 1,
			};

			return request(app.getHttpServer())
				.post('/orders')
				.send(create_order_dto)
				.expect(400)
				.expect((res) => {
					expect(res.body.message).toContain(
						'사용자 ID는 정수여야 합니다',
					);
				});
		});

		it('should fail when product_id is less than 1', () => {
			const create_order_dto = {
				user_id: 1,
				product_id: 0,
				quantity: 1,
			};

			return request(app.getHttpServer())
				.post('/orders')
				.send(create_order_dto)
				.expect(400)
				.expect((res) => {
					expect(res.body.message).toContain(
						'상품 ID는 1 이상이어야 합니다',
					);
				});
		});

		it('should fail when product_id exceeds maximum', () => {
			const create_order_dto = {
				user_id: 1,
				product_id: 1000000, // 최대값 999999 초과
				quantity: 1,
			};

			return request(app.getHttpServer())
				.post('/orders')
				.send(create_order_dto)
				.expect(400)
				.expect((res) => {
					expect(res.body.message).toContain(
						'상품 ID가 유효 범위를 초과했습니다',
					);
				});
		});

		it('should fail when product_id is not an integer', () => {
			const create_order_dto = {
				user_id: 1,
				product_id: 2.5, // 소수점 포함
				quantity: 1,
			};

			return request(app.getHttpServer())
				.post('/orders')
				.send(create_order_dto)
				.expect(400)
				.expect((res) => {
					expect(res.body.message).toContain(
						'상품 ID는 정수여야 합니다',
					);
				});
		});

		it('should fail when quantity is less than 1', () => {
			const create_order_dto = {
				user_id: 1,
				product_id: 2,
				quantity: 0,
			};

			return request(app.getHttpServer())
				.post('/orders')
				.send(create_order_dto)
				.expect(400)
				.expect((res) => {
					expect(res.body.message).toContain(
						'주문 수량은 1 이상이어야 합니다',
					);
				});
		});

		it('should fail when quantity exceeds maximum', () => {
			const create_order_dto = {
				user_id: 1,
				product_id: 2,
				quantity: 101, // 최대값 100 초과
			};

			return request(app.getHttpServer())
				.post('/orders')
				.send(create_order_dto)
				.expect(400)
				.expect((res) => {
					expect(res.body.message).toContain(
						'한 번에 주문할 수 있는 최대 수량은 100개입니다',
					);
				});
		});

		it('should fail when quantity is not an integer', () => {
			const create_order_dto = {
				user_id: 1,
				product_id: 2,
				quantity: 1.5, // 소수점 포함
			};

			return request(app.getHttpServer())
				.post('/orders')
				.send(create_order_dto)
				.expect(400)
				.expect((res) => {
					expect(res.body.message).toContain(
						'주문 수량은 정수여야 합니다',
					);
				});
		});

		it('should reject extra fields not in DTO', () => {
			const create_order_dto = {
				user_id: 1,
				product_id: 2,
				quantity: 1,
				extraField: 'should be rejected',
			};

			return request(app.getHttpServer())
				.post('/orders')
				.send(create_order_dto)
				.expect(400)
				.expect((res) => {
					expect(res.body.message).toContain(
						'property extraField should not exist',
					);
				});
		});
  });

  describe('/orders (GET)', () => {
		it('should return orders for a specific user', () => {
			const mock_orders = [
				{ order_id: 1, product: '상품A', quantity: 2 },
				{ order_id: 2, product: '상품B', quantity: 1 },
			];

			mock_ordersService.findByUserId.mockResolvedValue(mock_orders);

			return request(app.getHttpServer())
				.get('/orders?user_id=1')
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual(mock_orders);
					expect(
						mock_ordersService.findByUserId,
					).toHaveBeenCalledWith(1);
				});
		});

		it('should return empty array when user has no orders', () => {
			mock_ordersService.findByUserId.mockResolvedValue([]);

			return request(app.getHttpServer())
				.get('/orders?user_id=1')
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual([]);
					expect(
						mock_ordersService.findByUserId,
					).toHaveBeenCalledWith(1);
				});
		});

		it('should fail when user_id query parameter is missing', () => {
			return request(app.getHttpServer())
				.get('/orders')
				.expect(400)
				.expect((res) => {
					expect(res.body.message).toContain('Validation failed');
					expect(
						mock_ordersService.findByUserId,
					).not.toHaveBeenCalled();
				});
		});

		it('should fail when user_id is not a number', () => {
			return request(app.getHttpServer())
				.get('/orders?user_id=abc')
				.expect(400)
				.expect((res) => {
					expect(res.body.message).toContain('Validation failed');
					expect(
						mock_ordersService.findByUserId,
					).not.toHaveBeenCalled();
				});
		});

		it('should handle negative user_id (ParseIntPipe allows it)', () => {
			const mock_orders = [
				{ order_id: 1, product: '상품A', quantity: 1 },
			];

			mock_ordersService.findByUserId.mockResolvedValue(mock_orders);

			return request(app.getHttpServer())
				.get('/orders?user_id=-1')
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual(mock_orders);
					expect(
						mock_ordersService.findByUserId,
					).toHaveBeenCalledWith(-1);
				});
		});

		it('should handle zero user_id (ParseIntPipe allows it)', () => {
			const mock_orders = [
				{ order_id: 1, product: '상품A', quantity: 1 },
			];

			mock_ordersService.findByUserId.mockResolvedValue(mock_orders);

			return request(app.getHttpServer())
				.get('/orders?user_id=0')
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual(mock_orders);
					expect(
						mock_ordersService.findByUserId,
					).toHaveBeenCalledWith(0);
				});
		});

		it('should handle large valid user_id', () => {
			const large_user_id = 999999;
			const mock_orders = [
				{ order_id: 1, product: '상품A', quantity: 1 },
			];

			mock_ordersService.findByUserId.mockResolvedValue(mock_orders);

			return request(app.getHttpServer())
				.get(`/orders?user_id=${large_user_id}`)
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual(mock_orders);
					expect(
						mock_ordersService.findByUserId,
					).toHaveBeenCalledWith(large_user_id);
				});
		});
  });
});