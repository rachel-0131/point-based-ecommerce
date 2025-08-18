import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { AdminProductsController } from './admin-products.controller';
import { ProductsService } from './products.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [PrismaModule, AuthModule],
	controllers: [ProductsController, AdminProductsController],
	providers: [ProductsService],
})
export class ProductsModule {}
