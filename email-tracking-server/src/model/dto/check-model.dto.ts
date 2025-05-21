import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CheckModelDto {
  @IsString()
  @ApiProperty()
  provider: string;

  @IsString()
  @ApiProperty()
  apiKey: string;

  @IsString()
  @ApiProperty()
  model: string;

  @IsString()
  @ApiProperty()
  apiKeyType: string;
}
