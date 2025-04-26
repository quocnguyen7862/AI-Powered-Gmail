import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ContentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  threadId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  content: string;
}
