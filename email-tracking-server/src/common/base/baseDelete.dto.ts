import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export abstract class BaseDelete<T> {
  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    description: 'Timestamp indicating when the record was deleted',
    type: 'string',
    format: 'date-time',
  })
  deletedAt?: Date | null = null;
  constructor(partial: Partial<T>) {
    Object.assign(this, partial);
  }
}
