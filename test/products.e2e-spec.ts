import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ProductsController } from '../src/products/products.controller';
import { ProductsService } from '../src/products/products.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ProductsController (e2e)', () => {
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
    it('should return all products', () => {
      const mock_products = [
        { id: 1, name: '상품A', price: 1000, stock: 100 },
        { id: 2, name: '상품B', price: 2000, stock: 50 },
      ];

      mock_productsService.findAll.mockResolvedValue(mock_products);

      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mock_products);
          expect(mock_productsService.findAll).toHaveBeenCalledWith();
        });
    });

    it('should return empty array when no products exist', () => {
      mock_productsService.findAll.mockResolvedValue([]);

      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([]);
          expect(mock_productsService.findAll).toHaveBeenCalledWith();
        });
    });
  });

  describe('/products/:id (GET)', () => {
    it('should return a specific product by id', () => {
      const mock_product = { id: 1, name: '상품A', price: 1000, stock: 100 };

      mock_productsService.findOne.mockResolvedValue(mock_product);

      return request(app.getHttpServer())
        .get('/products/1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mock_product);
          expect(mock_productsService.findOne).toHaveBeenCalledWith(1);
        });
    });

    it('should handle valid numeric id', () => {
      const mock_product = { id: 999, name: '상품999', price: 5000, stock: 10 };

      mock_productsService.findOne.mockResolvedValue(mock_product);

      return request(app.getHttpServer())
        .get('/products/999')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mock_product);
          expect(mock_productsService.findOne).toHaveBeenCalledWith(999);
        });
    });

    it('should fail when id is not a number', () => {
      return request(app.getHttpServer())
        .get('/products/abc')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Validation failed');
          expect(mock_productsService.findOne).not.toHaveBeenCalled();
        });
    });

    it('should fail when id is a decimal number', () => {
      return request(app.getHttpServer())
        .get('/products/1.5')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Validation failed');
          expect(mock_productsService.findOne).not.toHaveBeenCalled();
        });
    });

    it('should handle negative id (ParseIntPipe allows it)', () => {
      const mock_product = { id: -1, name: '테스트상품', price: 1000, stock: 1 };

      mock_productsService.findOne.mockResolvedValue(mock_product);

      return request(app.getHttpServer())
        .get('/products/-1')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mock_product);
          expect(mock_productsService.findOne).toHaveBeenCalledWith(-1);
        });
    });

    it('should handle zero id (ParseIntPipe allows it)', () => {
      const mock_product = { id: 0, name: '테스트상품', price: 1000, stock: 1 };

      mock_productsService.findOne.mockResolvedValue(mock_product);

      return request(app.getHttpServer())
        .get('/products/0')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mock_product);
          expect(mock_productsService.findOne).toHaveBeenCalledWith(0);
        });
    });

    it('should handle very large valid id', () => {
      const large_id = 2147483647; // Max int32
      const mock_product = { id: large_id, name: '큰ID상품', price: 1000, stock: 1 };

      mock_productsService.findOne.mockResolvedValue(mock_product);

      return request(app.getHttpServer())
        .get(`/products/${large_id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mock_product);
          expect(mock_productsService.findOne).toHaveBeenCalledWith(large_id);
        });
    });
  });
});