import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReplyGenerateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  draftId: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  messageId?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;
}
