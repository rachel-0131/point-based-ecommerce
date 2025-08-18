import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChargePointDto {
  @ApiProperty({
    description: '충전할 포인트 금액',
    example: 1000,
  })
  @IsNumber()
  @IsPositive()
  amount: number;
}