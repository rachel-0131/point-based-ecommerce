import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponse, getSchemaPath } from '@nestjs/swagger';

export function StandardApiResponse<T extends Type<any>>(
	status: number,
	description: string,
	type?: T,
) {
	const base_properties = {
		success: { type: 'boolean', example: true },
		timestamp: { type: 'string', format: 'date-time' },
	};

	const schema = type
		? {
				properties: {
					...base_properties,
					data: { $ref: getSchemaPath(type) },
				},
		  }
		: {
				properties: {
					...base_properties,
					data: { type: 'object' },
				},
		  };

	return applyDecorators(
		ApiResponse({
			status,
			description,
			schema,
		}),
	);
}

export function ErrorApiResponse(status: number, description: string) {
	return applyDecorators(
		ApiResponse({
			status,
			description,
			schema: {
				properties: {
					success: { type: 'boolean', example: false },
					message: { type: 'string' },
					timestamp: { type: 'string', format: 'date-time' },
				},
			},
		}),
	);
}