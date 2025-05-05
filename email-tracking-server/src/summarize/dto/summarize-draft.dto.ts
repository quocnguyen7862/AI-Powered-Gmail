import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SummarizeDraftDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  threadId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  draftId: string;
}
