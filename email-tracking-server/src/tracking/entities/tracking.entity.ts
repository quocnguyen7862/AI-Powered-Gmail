import { BaseEntity } from '@/common/base/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ReceiverEntity } from './receiver.entity';

@Entity({ name: 'tracking' })
export class TrackingEntity extends BaseEntity {
  @Column()
  userId: string;

  @Column()
  userAddress: string;

  @Column()
  messageId: string;

  @Column({ unique: true })
  threadId: string;

  @Column({ unique: true })
  trackingId: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isSent: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  openedAt: Date;

  @OneToMany(() => ReceiverEntity, (receiverEntity) => receiverEntity.tracking)
  receivers: ReceiverEntity[];
}
