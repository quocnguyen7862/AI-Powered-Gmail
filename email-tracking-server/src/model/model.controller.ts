import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ModelService } from './model.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { CheckModelDto } from './dto/check-model.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { User } from '@/common/decorators/user.decorator';

@Controller('model')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Post()
  @Auth()
  create(@Body() createModelDto: CreateModelDto, @User() user: any) {
    return this.modelService.createModel(createModelDto, user.id);
  }

  @Get()
  findAll() {
    return this.modelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modelService.findById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModelDto: UpdateModelDto) {
    return this.modelService.update(+id, updateModelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.modelService.remove(+id);
  }

  @Post('check')
  @Auth()
  async checkModel(@Body() checkModelDto: CheckModelDto) {
    const result = await this.modelService.checkModel(checkModelDto);
    return result;
  }
}
