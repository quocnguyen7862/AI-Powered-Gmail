import { BaseEntity } from '@/common/base/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'tracking' })
export class TrackingEntity extends BaseEntity {
  @Column({ unique: true })
  emailId: string;

  @Column()
  userId: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isSent: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  openedAt: Date;
}
