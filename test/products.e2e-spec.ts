import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ProductsController } from '../src/products/products.controller';
import { ProductsService } from '../src/products/products.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('상품 컨트롤러 (e2e)', () => {
  let app: INestApplication;
  let mock_productsService: jest.Mocked<ProductsService>;
  let mockPrismaService: jest.Mocked<Partial<PrismaService>>;

  beforeEach(async () => {
    // Mock ProductsService
    mock_productsService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
    } as any;

    // Mock PrismaService
    mockPrismaService = {};

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mock_productsService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

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

  describe('/products (GET)', () => {
    it('모든 상품을 조회합니다', () => {
      const mock_products = [
        { id: 1, name: '상품A', price: 1000, stock: 100, is_sold_out: false },
        { id: 2, name: '상품B', price: 2000, stock: 50, is_sold_out: false },
      ];

      const mock_paginated_response = {
        success: true,
        data: mock_products,
        timestamp: new Date().toISOString(),
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          total_pages: 1
        }
      };

      mock_productsService.findAll.mockResolvedValue(mock_paginated_response);

      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mock_paginated_response);
          expect(mock_productsService.findAll).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 10 }));
        });
    });
  });

  describe('/products/:id (GET)', () => {
    it('ID로 특정 상품을 조회합니다', () => {
      const mock_product = { id: 1, name: '상품A', price: 1000, stock: 100, is_sold_out: false };

      mock_productsService.findOne.mockResolvedValue(mock_product);

      return request(app.getHttpServer())
        .get('/products/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mock_product);
          expect(mock_productsService.findOne).toHaveBeenCalledWith(1);
        });
    });
  });
});