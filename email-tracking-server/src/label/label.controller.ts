import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LabelService } from './label.service';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';
import { Auth } from '@/common/decorators/auth.decorator';
import { User } from '@/common/decorators/user.decorator';

@Controller('label')
@Auth()
export class LabelController {
  constructor(private readonly labelService: LabelService) {}
  @Get('message/:messageId')
  findByMessageId(@Param('messageId') messageId: string) {
    return this.labelService.findByMessageId(messageId);
  }

  @Post()
  create(@Body() createLabelDto: CreateLabelDto, @User() user: any) {
    return this.labelService.createMyLabel(createLabelDto, user.id);
  }

  @Get()
  findMyAll(@User() user: any) {
    return this.labelService.findMyAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User() user: any) {
    return this.labelService.findMyById(+id, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLabelDto: UpdateLabelDto) {
    return this.labelService.update(+id, updateLabelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: any) {
    return this.labelService.removeMyLabel(+id, user.id);
  }

  @Post('classify/:messageId')
  classifyLabel(
    @Param('messageId') messageId: string,
    @User() user: any,
    @Body('summary') summary: string,
  ) {
    return this.labelService.classifyLabel(messageId, user, summary);
  }
}
