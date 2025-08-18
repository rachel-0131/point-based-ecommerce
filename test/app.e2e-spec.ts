import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mockAppService: jest.Mocked<AppService>;

  beforeEach(async () => {
    // Mock AppService
    mockAppService = {
      getHello: jest.fn(),
    } as any;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
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

  describe('/ (GET)', () => {
    it('should return hello message', () => {
      const hello_message = 'Hello World!';
      
      mockAppService.getHello.mockReturnValue(hello_message);

      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.text).toBe(hello_message);
          expect(mockAppService.getHello).toHaveBeenCalledWith();
        });
    });

    it('should handle different return messages', () => {
      const custom_message = 'Welcome to Point-based E-commerce API!';
      
      mockAppService.getHello.mockReturnValue(custom_message);

      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.text).toBe(custom_message);
          expect(mockAppService.getHello).toHaveBeenCalledWith();
        });
    });

    it('should handle empty string response', () => {
      mockAppService.getHello.mockReturnValue('');

      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.text).toBe('');
          expect(mockAppService.getHello).toHaveBeenCalledWith();
        });
    });

    it('should call getHello method exactly once per request', () => {
      const hello_message = 'Hello World!';
      
      mockAppService.getHello.mockReturnValue(hello_message);

      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .then(() => {
          expect(mockAppService.getHello).toHaveBeenCalledTimes(1);
        });
    });
  });

  describe('HTTP Methods', () => {
    it('should not accept POST requests on root path', () => {
      return request(app.getHttpServer())
        .post('/')
        .expect(404);
    });

    it('should not accept PUT requests on root path', () => {
      return request(app.getHttpServer())
        .put('/')
        .expect(404);
    });

    it('should not accept DELETE requests on root path', () => {
      return request(app.getHttpServer())
        .delete('/')
        .expect(404);
    });

    it('should not accept PATCH requests on root path', () => {
      return request(app.getHttpServer())
        .patch('/')
        .expect(404);
    });
  });

  describe('Invalid Routes', () => {
    it('should return 404 for non-existent routes', () => {
      return request(app.getHttpServer())
        .get('/non-existent-route')
        .expect(404);
    });

    it('should return 404 for invalid nested routes', () => {
      return request(app.getHttpServer())
        .get('/invalid/nested/route')
        .expect(404);
    });
  });
});