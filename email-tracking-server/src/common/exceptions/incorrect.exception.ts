import { BadRequestException } from '@nestjs/common';
import { MessageError, MessageName } from '@/common/enums/message';

export class IncorrectException extends BadRequestException {
  constructor(text: MessageName) {
    super(MessageError.INCORRECT(text));
  }
}
