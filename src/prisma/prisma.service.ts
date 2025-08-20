import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(PrismaService.name);
	private isConnected = false;
	private connectionRetries = 0;
	private readonly maxRetries = 3;
	private readonly retryDelay = 2000;

	constructor(private configService: ConfigService) {
		super({
			log: [
				{ emit: 'event', level: 'query' },
				{ emit: 'event', level: 'error' },
				{ emit: 'event', level: 'info' },
				{ emit: 'event', level: 'warn' },
			],
			errorFormat: 'colorless',
		});

		this.setupEventListeners();
	}

	async onModuleInit() {
		try {
			await this.connectWithRetry();
			this.logger.log('Database connection established');
		} catch (error) {
			this.logger.error('Failed to connect to database after multiple retries', error);
			throw error;
		}
	}

	async onModuleDestroy() {
		try {
			await this.gracefulDisconnect();
			this.logger.log('Database connection closed gracefully');
		} catch (error) {
			this.logger.error('Error during database disconnection', error);
		}
	}

	private async connectWithRetry(): Promise<void> {
		while (this.connectionRetries < this.maxRetries) {
			try {
				await this.$connect();
				this.isConnected = true;
				this.connectionRetries = 0;
				return;
			} catch (error) {
				this.connectionRetries++;
				this.logger.warn(
					`Database connection attempt ${this.connectionRetries} failed. ${this.maxRetries - this.connectionRetries} attempts remaining.`,
					error,
				);

				if (this.connectionRetries >= this.maxRetries) {
					throw new Error(`Failed to connect to database after ${this.maxRetries} attempts`);
				}

				await this.delay(this.retryDelay);
			}
		}
	}

	private async gracefulDisconnect(): Promise<void> {
		if (this.isConnected) {
			await this.$disconnect();
			this.isConnected = false;
		}
	}

	private setupEventListeners(): void {
		this.$on('query', (e) => {
			if (this.configService.get('NODE_ENV') === 'development') {
				this.logger.debug(`Query: ${e.query}`);
				this.logger.debug(`Params: ${e.params}`);
				this.logger.debug(`Duration: ${e.duration}ms`);
			}
		});

		this.$on('error', (e) => {
			this.logger.error('Prisma Error:', e);
		});

		this.$on('info', (e) => {
			this.logger.log(`Prisma Info: ${e.message}`);
		});

		this.$on('warn', (e) => {
			this.logger.warn(`Prisma Warning: ${e.message}`);
		});
	}

	public async healthCheck(): Promise<{ status: string; latency: number }> {
		const start = Date.now();
		try {
			await this.$queryRaw`SELECT 1`;
			const latency = Date.now() - start;
			return { status: 'healthy', latency };
		} catch (error) {
			this.logger.error('Database health check failed', error);
			return { status: 'unhealthy', latency: Date.now() - start };
		}
	}

	public isHealthy(): boolean {
		return this.isConnected;
	}

	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}
