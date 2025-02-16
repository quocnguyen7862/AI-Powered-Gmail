import { BadRequestException } from '@nestjs/common';
import { MessageError, MessageName } from '@/common/enums/message';

export class VerifiedException extends BadRequestException {
  constructor(text: MessageName) {
    super(MessageError.VERIFIED(text));
  }
}
