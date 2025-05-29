import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Patch,
} from '@nestjs/common';
import { ModelService } from './model.service';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { CheckModelDto } from './dto/check-model.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { User } from '@/common/decorators/user.decorator';

@Controller('model')
@Auth()
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Post()
  @Auth()
  create(@Body() createModelDto: CreateModelDto, @User() user: any) {
    return this.modelService.createMyModel(createModelDto, user.id);
  }

  @Get()
  @Auth()
  findAll(@User() user: any) {
    return this.modelService.findByUserId(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modelService.findById(+id);
  }

  @Put(':id')
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updateModelDto: UpdateModelDto,
    @User() user: any,
  ) {
    return this.modelService.updateMyModel(+id, updateModelDto, user.id);
  }

  @Patch('active/:id')
  @Auth()
  async activeModel(
    @Param('id') id: string,
    @User() user: any,
    @Body() payload: { isActive: boolean },
  ) {
    return await this.modelService.activeMyModel(
      +id,
      user.id,
      payload.isActive,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) {
    return this.modelService.removeMyModel(+id, user.id);
  }

  @Post('check')
  @Auth()
  async checkModel(@Body() checkModelDto: CheckModelDto) {
    const result = await this.modelService.checkModel(checkModelDto);
    return result;
  }
}
