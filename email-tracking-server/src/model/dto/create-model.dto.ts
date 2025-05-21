import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateModelDto {
  @IsString()
  @ApiProperty()
  name: string;

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
