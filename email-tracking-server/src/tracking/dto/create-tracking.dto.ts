import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTrackingDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  messageId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  threadId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  trackingId: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @ApiProperty()
  receiverAddress: string[];
}
