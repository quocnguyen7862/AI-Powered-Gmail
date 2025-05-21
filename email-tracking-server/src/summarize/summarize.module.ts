import { Module } from '@nestjs/common';
import { SummarizeService } from './summarize.service';
import { SummarizeController } from './summarize.controller';
import { SummarizeSchema } from './entities/summarize.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelModule } from '@/model/model.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SUMMARIZE_MODEL', schema: SummarizeSchema },
    ]),
    ModelModule,
  ],
  controllers: [SummarizeController],
  providers: [SummarizeService],
})
export class SummarizeModule {}
