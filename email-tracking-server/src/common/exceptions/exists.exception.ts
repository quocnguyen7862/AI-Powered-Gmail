import { BadRequestException } from '@nestjs/common';
import { MessageError, MessageName } from '@/common/enums/message';

export class ExistsException extends BadRequestException {
  constructor(text: MessageName) {
    super(MessageError.EXISTS(text));
  }
}
