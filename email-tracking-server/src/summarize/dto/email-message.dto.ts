import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EmailMessageDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  threadId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  messageId: string;
}
