import { BadRequestException } from '@nestjs/common';
import { MessageError, MessageName } from '@/common/enums/message';

export class InvalidException extends BadRequestException {
  constructor(text: MessageName) {
    super(MessageError.INVALID(text));
  }
}
