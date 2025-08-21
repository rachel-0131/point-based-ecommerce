# 포인트 기반 이커머스 시스템

포인트를 활용한 이커머스 시스템으로 사용자는 포인트를 충전하여 상품을 구매할 수 있습니다.

## 설치 및 실행

### 설치 요구사항

- Node.js (v18 이상)
- Docker & Docker Compose

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd point-based-ecommerce
```

### 2. Docker Compose로 실행 (권장)

#### 기본 실행 (기본 설정 사용)

```bash
# Docker Compose로 전체 서비스 실행
docker-compose up --build
```

환경 변수 설정이 필요합니다.
```bash
# 1. .env.example을 복사해 .env 생성
cp .env.example .env

# 2. .env 파일을 열어서 패스워드 변경
# MYSQL_ROOT_PASSWORD=password
# JWT_SECRET=jwt

# 3. Docker Compose 실행
docker-compose up --build

# 또는 환경 변수로 직접 설정
MYSQL_ROOT_PASSWORD=password docker-compose up --build

# 백그라운드에서 실행 (데몬 모드)
docker-compose up -d --build
```

위 명령어로 다음을 자동으로 수행합니다:
- MySQL 8.0 데이터베이스 컨테이너 실행
- Node.js 애플리케이션 빌드 및 실행
- 데이터베이스 스키마 자동 생성 (마이그레이션 포함)
- 환경 변수 기반 설정 적용

#### Docker 서비스 종료
```bash
# 컨테이너 중지
docker-compose down

# 컨테이너 중지 + 볼륨 삭제 (데이터베이스 데이터 삭제됨)
docker-compose down -v

# 컨테이너 중지 + 이미지 삭제
docker-compose down --rmi all
```


### 3. 로컬 환경에서 실행

#### 3.1 데이터베이스 설정

**옵션 1: Docker로 MySQL만 실행**
```bash
# MySQL 컨테이너만 실행
docker-compose up db -d
```

**옵션 2: 로컬 MySQL 사용**
- MySQL 8.0 설치 및 실행
- 데이터베이스 생성:
```sql
CREATE DATABASE point_ecommerce;
```

#### 3.2 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가합니다:

```env
DATABASE_URL="mysql://root:password@localhost:3306/point_ecommerce"
JWT_SECRET="jwt-key"
PORT=3000
```

#### 3.3 의존성 설치 및 데이터베이스 초기화

```bash
# 의존성 설치
npm install

# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션 적용
npx prisma migrate deploy
```

#### 3.4 애플리케이션 실행

```bash
# 개발 모드로 실행 (자동 재시작)
npm run start:dev

# 또는 프로덕션 빌드 후 실행
npm run build
npm run start:prod
```

## API 명세 (Swagger)

애플리케이션이 실행된 후 Swagger UI를 통해 API 문서를 확인할 수 있습니다.

### 접속 방법
- 로컬: http://localhost:3000/api
- Docker Compose 실행 시: http://localhost:3000/api

### 주요 API 엔드포인트
- **인증**: `/auth/login`, `/auth/register`
- **사용자**: `/users` (사용자 정보, 포인트 충전 등)
- **상품**: `/products` (상품 목록, 검색 등)
- **관리자 상품**: `/admin/products` (상품 등록, 수정, 삭제)
- **주문**: `/orders` (주문 생성, 조회 등)

### 인증 방법
Swagger UI에서 Bearer Token 인증을 사용합니다:
1. `/auth/login`으로 로그인 후 JWT 토큰 획득
2. Swagger UI 상단의 "Authorize" 버튼 클릭
3. `Bearer {토큰}` 형식으로 입력

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

## 컨벤션

```bash
npm run lint          # ESLint 실행
npm run format        # Prettier 포매팅
```
