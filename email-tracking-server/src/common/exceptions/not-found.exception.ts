import { BadRequestException } from '@nestjs/common';
import { MessageError, MessageName } from '@/common/enums/message';

export class NotFoundException extends BadRequestException {
  constructor(text: MessageName) {
    super(MessageError.NOT_FOUND(text));
  }
}
