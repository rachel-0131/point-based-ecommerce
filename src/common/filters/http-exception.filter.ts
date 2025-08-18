import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = 'Internal server error';

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			const exception_response = exception.getResponse();
			message =
				typeof exception_response === 'string'
					? exception_response
					: (exception_response as any).message || exception.message;
		} else if (exception instanceof Error) {
			message = exception.message;
		}

		const error_response: ApiResponse = {
			success: false,
			message: Array.isArray(message) ? message.join(', ') : message,
			timestamp: new Date().toISOString(),
		};

		response.status(status).json(error_response);
	}
}