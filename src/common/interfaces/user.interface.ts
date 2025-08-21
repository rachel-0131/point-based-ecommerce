export interface User {
	id: number;
	email: string;
	name: string;
	point?: number;
}

export interface JwtPayload {
	sub: number;
	email: string;
}