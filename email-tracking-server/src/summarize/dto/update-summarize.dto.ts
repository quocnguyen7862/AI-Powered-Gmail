import { PartialType } from '@nestjs/swagger';
import { CreateSummarizeDto } from './create-summarize.dto';

export class UpdateSummarizeDto extends PartialType(CreateSummarizeDto) {}
