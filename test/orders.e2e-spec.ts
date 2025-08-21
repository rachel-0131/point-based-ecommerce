import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { OrdersController } from '../src/orders/orders.controller';
import { OrdersService } from '../src/orders/orders.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

describe('주문 컨트롤러 (e2e)', () => {
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

    // Mock JwtAuthGuard to bypass authentication and set user context
    mockJwtAuthGuard = {
      canActivate: jest.fn().mockImplementation((context) => {
        const request = context.switchToHttp().getRequest();
        // Mock user based on the user_id from query params
        const user_id = parseInt(request.query.user_id) || 1;
        request.user = { id: user_id };
        return true;
      }),
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
		it('새 주문을 성공적으로 생성합니다', () => {
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
  });

  describe('/orders (GET)', () => {
		it('특정 사용자의 주문 내역을 조회합니다', () => {
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
  });
});