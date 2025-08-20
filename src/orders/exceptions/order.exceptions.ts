import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ORDER_ERROR_MESSAGES } from '../constants/error-messages.constants';

export class InsufficientPointsException extends BadRequestException {
	constructor(message: string = ORDER_ERROR_MESSAGES.INSUFFICIENT_POINTS) {
		super(message);
	}
}

export class InsufficientStockException extends BadRequestException {
	constructor(message: string = ORDER_ERROR_MESSAGES.INSUFFICIENT_STOCK) {
		super(message);
	}
}

export class UserNotFoundException extends NotFoundException {
	constructor(message: string = ORDER_ERROR_MESSAGES.USER_NOT_FOUND) {
		super(message);
	}
}

export class ProductNotFoundException extends NotFoundException {
	constructor(message: string = ORDER_ERROR_MESSAGES.PRODUCT_NOT_FOUND) {
		super(message);
	}
}

export class ProductNotAvailableException extends BadRequestException {
	constructor(message: string = ORDER_ERROR_MESSAGES.PRODUCT_NOT_AVAILABLE) {
		super(message);
	}
}