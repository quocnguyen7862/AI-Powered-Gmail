import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatbotDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  message: string;
}
