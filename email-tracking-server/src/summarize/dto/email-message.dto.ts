import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EmailMessageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  threadId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  messageId: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  language?: string;
}
