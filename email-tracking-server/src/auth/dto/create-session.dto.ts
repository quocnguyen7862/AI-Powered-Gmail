import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  fullName?: string;

  @IsString()
  @ApiProperty()
  accessToken: string;

  @IsNumber()
  @ApiProperty()
  expiryDate: number;

  @IsString()
  @IsOptional()
  @ApiProperty()
  refreshToken: string | undefined;

  @IsNumber()
  @ApiProperty()
  refreshTokenExpiresIn: number;

  @IsString()
  @ApiProperty()
  tokenType: string;

  @IsString()
  @ApiProperty()
  scope: string;

  @IsString()
  @ApiProperty()
  idToken: string;

  @IsString()
  @ApiProperty()
  userId: string;

  @IsString()
  @ApiProperty()
  email: string;
}
