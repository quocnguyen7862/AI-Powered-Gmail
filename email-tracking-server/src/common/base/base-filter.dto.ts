import { OrderType } from '@enums/order';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { IsOptional, Max, Min } from 'class-validator';

export abstract class BaseFilterDto<T> {
  @ApiPropertyOptional({
    maximum: 50,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @Max(50)
  readonly limit?: number = 10;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  readonly page?: number = 1;

  @Expose()
  @Transform(({ obj: { limit, page } }) => (page - 1) * limit)
  readonly skip?: number = 1;

  abstract readonly order?: { [P in keyof T]?: OrderType };
}
