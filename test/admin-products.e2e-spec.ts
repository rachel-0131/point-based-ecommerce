import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AdminProductsController } from '../src/products/admin-products.controller';
import { ProductsService } from '../src/products/products.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AdminProductsController (e2e)', () => {
  let app: INestApplication;
  let mockProductsService: jest.Mocked<ProductsService>;
  let mockPrismaService: jest.Mocked<Partial<PrismaService>>;

  beforeEach(async () => {
    // Mock ProductsService
    mockProductsService = {
      create: jest.fn(),
    } as any;

    // Mock PrismaService
    mockPrismaService = {};

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AdminProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
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

  describe('/admin/products (POST)', () => {
    it('should create a new product successfully', () => {
      const create_product_dto = {
        name: '테스트 상품',
        price: 1000,
        stock: 100,
      };

      mockProductsService.create.mockResolvedValue({ id: 1 });

      return request(app.getHttpServer())
        .post('/admin/products')
        .send(create_product_dto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(typeof res.body.id).toBe('number');
          expect(mockProductsService.create).toHaveBeenCalledWith(create_product_dto);
        });
    });

    it('should create a product without stock (optional field)', () => {
      const create_product_dto = {
        name: '스톡 없는 상품',
        price: 2000,
      };

      mockProductsService.create.mockResolvedValue({ id: 2 });

      return request(app.getHttpServer())
        .post('/admin/products')
        .send(create_product_dto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(typeof res.body.id).toBe('number');
          expect(mockProductsService.create).toHaveBeenCalledWith(create_product_dto);
        });
    });

    it('should fail when name is empty', () => {
      const create_product_dto = {
        name: '',
        price: 1000,
        stock: 100,
      };

      return request(app.getHttpServer())
        .post('/admin/products')
        .send(create_product_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('상품명은 필수입니다');
        });
    });

    it('should fail when name is too long', () => {
      const create_product_dto = {
        name: 'a'.repeat(101), // 101자
        price: 1000,
        stock: 100,
      };

      return request(app.getHttpServer())
        .post('/admin/products')
        .send(create_product_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('상품명은 최대 100자까지 가능합니다');
        });
    });

    it('should fail when price is not provided', () => {
      const create_product_dto = {
        name: '테스트 상품',
        stock: 100,
      };

      return request(app.getHttpServer())
        .post('/admin/products')
        .send(create_product_dto)
        .expect(400);
    });

    it('should fail when price is less than 1', () => {
      const create_product_dto = {
        name: '테스트 상품',
        price: 0,
        stock: 100,
      };

      return request(app.getHttpServer())
        .post('/admin/products')
        .send(create_product_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('상품 가격은 1원 이상이어야 합니다');
        });
    });

    it('should fail when price exceeds maximum', () => {
      const create_product_dto = {
        name: '테스트 상품',
        price: 10000001, // 최대값 초과
        stock: 100,
      };

      return request(app.getHttpServer())
        .post('/admin/products')
        .send(create_product_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('상품 가격은 10,000,000원 이하여야 합니다');
        });
    });

    it('should fail when price is not an integer', () => {
      const create_product_dto = {
        name: '테스트 상품',
        price: 1000.5, // 소수점 포함
        stock: 100,
      };

      return request(app.getHttpServer())
        .post('/admin/products')
        .send(create_product_dto)
        .expect(400);
    });

    it('should fail when stock is negative', () => {
      const create_product_dto = {
        name: '테스트 상품',
        price: 1000,
        stock: -1,
      };

      return request(app.getHttpServer())
        .post('/admin/products')
        .send(create_product_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('재고 수량은 0 이상이어야 합니다');
        });
    });

    it('should fail when stock exceeds maximum', () => {
      const create_product_dto = {
        name: '테스트 상품',
        price: 1000,
        stock: 1000000, // 최대값 초과
      };

      return request(app.getHttpServer())
        .post('/admin/products')
        .send(create_product_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('재고 수량은 999,999개 이하여야 합니다');
        });
    });

    it('should fail when stock is not an integer', () => {
      const create_product_dto = {
        name: '테스트 상품',
        price: 1000,
        stock: 100.5, // 소수점 포함
      };

      return request(app.getHttpServer())
        .post('/admin/products')
        .send(create_product_dto)
        .expect(400);
    });

    it('should fail when name is not a string', () => {
      const create_product_dto = {
        name: 123, // 문자열이 아님
        price: 1000,
        stock: 100,
      };

      return request(app.getHttpServer())
        .post('/admin/products')
        .send(create_product_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('상품명은 문자열이어야 합니다');
        });
    });

    it('should reject extra fields not in DTO', () => {
      const create_product_dto = {
        name: '테스트 상품',
        price: 1000,
        stock: 100,
        extraField: 'should be rejected', // 추가 필드
      };

      return request(app.getHttpServer())
        .post('/admin/products')
        .send(create_product_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('property extraField should not exist');
        });
    });
  });
});