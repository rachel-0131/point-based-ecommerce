import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/services/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockPrismaService: jest.Mocked<Partial<PrismaService>>;

  beforeEach(async () => {
    // Mock AuthService
    mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    } as any;

    // Mock PrismaService
    mockPrismaService = {};

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
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

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', () => {
      const register_dto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: '홍길동',
      };

      const mock_result = {
        id: 1,
        email: 'test@example.com',
        name: '홍길동',
      };

      mockAuthService.register.mockResolvedValue(mock_result);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(register_dto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(mock_result);
          expect(mockAuthService.register).toHaveBeenCalledWith(register_dto);
        });
    });

    it('should fail when email is invalid', () => {
      const register_dto = {
        email: 'invalid-email',
        password: 'Password123!',
        name: '홍길동',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(register_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('email must be an email');
        });
    });

    it('should fail when email is empty', () => {
      const register_dto = {
        email: '',
        password: 'Password123!',
        name: '홍길동',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(register_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('email should not be empty');
        });
    });

    it('should fail when password is too short', () => {
      const register_dto = {
        email: 'test@example.com',
        password: 'Pass1!', // 6자 (10자 미만)
        name: '홍길동',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(register_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('password must be longer than or equal to 10 characters');
        });
    });

    it('should fail when password lacks special characters', () => {
      const register_dto = {
        email: 'test@example.com',
        password: 'Password123', // 특수문자 없음
        name: '홍길동',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(register_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다');
        });
    });

    it('should fail when password lacks numbers', () => {
      const register_dto = {
        email: 'test@example.com',
        password: 'Password!@#', // 숫자 없음
        name: '홍길동',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(register_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다');
        });
    });

    it('should fail when password lacks letters', () => {
      const register_dto = {
        email: 'test@example.com',
        password: '1234567890!', // 영문 없음
        name: '홍길동',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(register_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다');
        });
    });

    it('should fail when name is empty', () => {
      const register_dto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: '',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(register_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('name should not be empty');
        });
    });

    it('should fail when name is not a string', () => {
      const register_dto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 123,
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(register_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('name must be a string');
        });
    });

    it('should reject extra fields not in DTO', () => {
      const register_dto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: '홍길동',
        extraField: 'should be rejected',
      };

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(register_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('property extraField should not exist');
        });
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login successfully', () => {
      const login_dto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mock_result = {
        accessToken: 'jwt-token-here',
        user: {
          id: 1,
          email: 'test@example.com',
          name: '홍길동',
        },
      };

      mockAuthService.login.mockResolvedValue(mock_result);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(login_dto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(mock_result);
          expect(mockAuthService.login).toHaveBeenCalledWith(login_dto);
        });
    });

    it('should fail when email is invalid', () => {
      const login_dto = {
        email: 'invalid-email',
        password: 'Password123!',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(login_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('email must be an email');
        });
    });

    it('should fail when email is empty', () => {
      const login_dto = {
        email: '',
        password: 'Password123!',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(login_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('email should not be empty');
        });
    });

    it('should fail when password is empty', () => {
      const login_dto = {
        email: 'test@example.com',
        password: '',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(login_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('password should not be empty');
        });
    });

    it('should fail when password is not a string', () => {
      const login_dto = {
        email: 'test@example.com',
        password: 123,
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(login_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('password must be a string');
        });
    });

    it('should fail when email is missing', () => {
      const login_dto = {
        password: 'Password123!',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(login_dto)
        .expect(400);
    });

    it('should fail when password is missing', () => {
      const login_dto = {
        email: 'test@example.com',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(login_dto)
        .expect(400);
    });

    it('should reject extra fields not in DTO', () => {
      const login_dto = {
        email: 'test@example.com',
        password: 'Password123!',
        extraField: 'should be rejected',
      };

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(login_dto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('property extraField should not exist');
        });
    });
  });
});