# 포인트 기반 E-commerce API

## 주요 기능

### 사용자 관리
- 회원가입/로그인: JWT 기반 인증 시스템
- 포인트 충전: 사용자 포인트 충전 기능
- 포인트 내역 조회: 충전/사용 내역 확인

### 상품 관리
- 상품 조회: 전체 상품 목록 및 상세 정보 조회
- 관리자 상품 관리: 상품 등록, 수정, 삭제 (관리자 전용)
- 재고 관리: 실시간 재고 수량 관리

### 주문 관리
- 상품 주문: 포인트를 사용한 상품 구매
- 주문 내역: 사용자별 주문 내역 조회
- 재고 차감: 주문 시 자동 재고 차감

## 기술 스택

- 프레임워크: NestJS
- 데이터베이스: MySQL
- ORM: Prisma
- 인증: JWT (Passport)
- 유효성 검사: class-validator, class-transformer
- API 문서화: Swagger
- 테스트: Jest

## API 문서

서버 실행 후 `http://localhost:3000/api` 에서 Swagger 문서를 확인할 수 있습니다.

### 주요 API 엔드포인트

#### 인증
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인

#### 사용자
- `GET /users/profile` - 프로필 조회
- `POST /users/charge-point` - 포인트 충전
- `GET /users/point-history` - 포인트 내역 조회

#### 상품
- `GET /products` - 상품 목록 조회
- `GET /products/:id` - 상품 상세 조회
- `POST /admin/products` - 상품 등록 (관리자)
- `PUT /admin/products/:id` - 상품 수정 (관리자)
- `DELETE /admin/products/:id` - 상품 삭제 (관리자)

#### 주문
- `POST /orders` - 상품 주문
- `GET /orders` - 주문 내역 조회

## 실행 방법

### Docker Compose 사용 (권장)

1. 리포지토리 클론
   ```bash
   git clone <repository-url>
   cd point-based-ecommerce
   ```

2. Docker Compose로 실행
   ```bash
   docker-compose up -d
   ```

3. 데이터베이스 마이그레이션
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

4. 애플리케이션 접속
   - API: http://localhost:3000
   - Swagger 문서: http://localhost:3000/api

### 로컬 개발 환경

1. 의존성 설치
   ```bash
   npm install
   ```

2. 환경 변수 설정
   ```bash
   cp .env.example .env
   # .env 파일을 열어 데이터베이스 연결 정보 등을 수정
   ```

3. MySQL 데이터베이스 준비
   ```bash
   # MySQL 서버 실행 후 데이터베이스 생성
   mysql -u root -p
   CREATE DATABASE point_ecommerce;
   ```

4. Prisma 마이그레이션
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. 개발 서버 실행
   ```bash
   npm run start:dev
   ```

## 테스트

### E2E 테스트
```bash
npm run test:e2e
```

## 환경 변수

```env
# 데이터베이스 설정
DATABASE_URL="mysql://username:password@host:port/database"

# JWT 설정
JWT_SECRET="jwt-secret-key"

# 애플리케이션 설정
PORT=3000
```

## 프로젝트 구조

```
src/
├── auth/           # 인증 관련 모듈
├── users/          # 사용자 관리 모듈
├── products/       # 상품 관리 모듈
├── orders/         # 주문 관리 모듈
├── prisma/         # Prisma 설정
└── common/         # 공통 유틸리티
    ├── decorators/ # 커스텀 데코레이터
    ├── filters/    # 예외 필터
    ├── interceptors/ # 응답 인터셉터
    └── interfaces/ # 인터페이스 정의
```

## 개발 가이드

### 코드 스타일
```bash
npm run lint          # ESLint 실행
npm run format        # Prettier 포매팅
```

### 빌드
```bash
npm run build         # 프로덕션 빌드
npm run start:prod    # 프로덕션 모드 실행
```
