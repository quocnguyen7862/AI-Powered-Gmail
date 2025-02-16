import { InternalServerErrorException } from '@nestjs/common';
import { MessageError } from '@/common/enums/message';

export class SendMailFailedException extends InternalServerErrorException {
  constructor() {
    super(MessageError.SEND_MAIL_FAILED());
  }
}
