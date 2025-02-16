import { BaseEntity } from '@/common/base/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'tracking' })
export class Tracking extends BaseEntity {
  @Column()
  emailId: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  openedAt: Date;
}
